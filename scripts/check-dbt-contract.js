/**
 * Validates every metric's dbt references against dbt's published manifest.
 *
 * This is the one failure class no other gate here can see. `pnpm run check` proves a metric
 * is registered consistently *inside this repo*; dbt's own tests prove its models are
 * healthy. Neither notices when dbt renames or drops a model a card reads — the model stays
 * green, the card goes silently empty, and there is no commit in this repo to trigger on.
 * See docs/lessons/upstream-rename-breaks-a-card.md
 *
 * The manifest is a public gh-pages artifact, so this needs no warehouse credentials and no
 * secrets. It is a network dependency though, so a fetch failure is a warning and never a
 * failed build — only a resolved mismatch fails.
 *
 * Two rules, both resting on manifest *configuration* rather than manifest documentation:
 *   unknown model     a dbt.<table> reference matching no model or seed
 *   dev-tagged model  a reference to a model tagged `dev`, which the production run
 *                     (`--select tag:production`) does not build, test, or monitor
 *
 * Deliberately NOT checked: whether a declared xField/yField is a real column. The manifest
 * lists columns that schema.yml *documents*, which is not the same as the columns the table
 * has — dbt.api_esg_cif_network_vs_countries_daily documents `carbon_intensity` while the
 * view actually returns `carbon_intensity_gco2_kwh`. A column rule built on this flags
 * correct metrics.
 *
 * The artifact that would carry real columns, catalog.json, is published with zero model
 * nodes, and that is not a build waiting to be fixed: dbt-cerebro records it as known
 * dbt-clickhouse adapter behaviour and tells consumers not to build tooling on model-level
 * catalog entries (its own semantic pipeline is manifest-only). Column-level validation is
 * out of reach from a public artifact, so do not plan around it returning.
 *
 * Usage:
 *   node scripts/check-dbt-contract.js              check, exit 1 on violations
 *   node scripts/check-dbt-contract.js --refresh    ignore the local manifest cache
 *   node scripts/check-dbt-contract.js --update     rewrite the ratchet files
 *   DBT_MANIFEST_PATH=... node scripts/check-dbt-contract.js   use a local manifest
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..');
const srcQueriesDir = path.join(repoRoot, 'src/queries');
const publicDir = path.join(repoRoot, 'public');
const rootDashboardFile = path.join(publicDir, 'dashboard.yml');
const allowDir = path.join(__dirname, 'allow');
const cacheDir = path.join(repoRoot, 'node_modules/.cache');
const cacheFile = path.join(cacheDir, 'dbt-manifest.json');

const MANIFEST_URL =
  process.env.DBT_MANIFEST_URL || 'https://gnosischain.github.io/dbt-cerebro/manifest.json';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const STALE_MANIFEST_DAYS = 14;

/**
 * Models tagged `dev` are WIP: the production run is `dbt run --select tag:production` and
 * `dbt docs generate --exclude tag:dev`, so nothing in the daily pipeline builds, tests, or
 * Elementary-monitors them. The view may still resolve — the eight currently in the ratchet
 * all return rows — but a card reading one sits outside every upstream quality gate.
 *
 * Absence of `production` is deliberately NOT the rule. Live models carry `tag:live` and are
 * built by their own schedule, and intermediate models are pulled in as dependencies, so
 * "untagged" would flag plenty of healthy references.
 */
const DEV_TAG = 'dev';

// Fields that name a metric outside a `metrics:` array. Kept in step with check-metrics.js.
const METRIC_REFERENCE_FIELDS = ['globalFilterSourceMetric', 'explicitFilterValidationMetric'];

const refreshMode = process.argv.includes('--refresh');
const updateMode = process.argv.includes('--update');

const readField = (content, field) => {
  const re = new RegExp(
    `(?:^|[\\s,{])['"]?${field}['"]?\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`
  );
  const match = content.match(re);
  return match ? match[2] : null;
};

const loadAllow = (name) => {
  const file = path.join(allowDir, name);
  if (!fs.existsSync(file)) return new Set();
  return new Set(
    fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*$/, '').trim())
      .filter(Boolean)
  );
};

const writeAllow = (name, entries, heading) => {
  if (!fs.existsSync(allowDir)) fs.mkdirSync(allowDir, { recursive: true });
  const body = [...entries].sort();
  fs.writeFileSync(
    path.join(allowDir, name),
    `${heading.trim()}\n\n${body.join('\n')}${body.length ? '\n' : ''}`
  );
};

// --- manifest ----------------------------------------------------------------------------

const loadManifestText = async () => {
  const localPath = process.env.DBT_MANIFEST_PATH;
  if (localPath) {
    if (!fs.existsSync(localPath)) throw new Error(`DBT_MANIFEST_PATH does not exist: ${localPath}`);
    return { text: fs.readFileSync(localPath, 'utf8'), origin: localPath };
  }

  if (!refreshMode && fs.existsSync(cacheFile)) {
    const age = Date.now() - fs.statSync(cacheFile).mtimeMs;
    if (age < CACHE_TTL_MS) {
      return {
        text: fs.readFileSync(cacheFile, 'utf8'),
        origin: `local cache, ${Math.round(age / 60000)}m old`,
      };
    }
  }

  const response = await fetch(MANIFEST_URL);
  if (!response.ok) throw new Error(`${MANIFEST_URL} returned HTTP ${response.status}`);
  const text = await response.text();

  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, text);
  } catch {
    // A cache write failure is not worth failing over; the fetch already succeeded.
  }

  return { text, origin: MANIFEST_URL };
};

/**
 * name -> { resourceType, tags } for everything dbt materialises into the `dbt` schema.
 * Seeds count: they are real tables and metrics join to them.
 */
const indexRelations = (manifest) => {
  const relations = new Map();
  for (const node of Object.values(manifest.nodes || {})) {
    if (node.resource_type !== 'model' && node.resource_type !== 'seed') continue;
    if (String(node.schema || '').toLowerCase() !== 'dbt') continue;
    const name = node.alias || node.name;
    if (!name) continue;
    relations.set(name.toLowerCase(), {
      resourceType: node.resource_type,
      tags: new Set(node.tags || []),
    });
  }
  return relations;
};

// --- what actually renders ----------------------------------------------------------------

/**
 * Metric ids that reach a browser: placed under a sector with no `enabled: false` in
 * dashboard.yml, in a tab with no `enabled: false` of its own.
 *
 * This distinction is the whole point of the dev-tag rule below. Shipping a card against a
 * WIP model is the mistake; *staging* one behind a disabled sector is the correct workflow,
 * and the repo already does it deliberately — gnosis-revenue.yml carries
 * `enabled: false  # models not yet in prod`. Flagging those would punish the right habit,
 * and worse, it would put them in the ratchet, so the check would stay silent at the one
 * moment it matters: when someone enables the sector while the models are still `dev`.
 */
const collectRenderedIds = () => {
  const rendered = new Set();
  if (!fs.existsSync(rootDashboardFile)) return rendered;

  const sectors = yaml.load(fs.readFileSync(rootDashboardFile, 'utf8')) || {};
  for (const sector of Object.values(sectors)) {
    if (!sector || typeof sector !== 'object') continue;
    if (sector.enabled === false) continue;
    if (typeof sector.source !== 'string') continue;

    const file = path.join(publicDir, sector.source.replace(/^\/+/, ''));
    if (!fs.existsSync(file)) continue;

    let doc;
    try {
      doc = yaml.load(fs.readFileSync(file, 'utf8'));
    } catch {
      // check-metrics.js reports unparseable dashboard YAML; do not duplicate that failure.
      continue;
    }

    for (const tab of Array.isArray(doc?.tabs) ? doc.tabs : []) {
      if (!tab || typeof tab !== 'object' || tab.enabled === false) continue;
      collectMetricIds(tab, rendered);
    }
  }
  return rendered;
};

/**
 * Ids from every `metrics:` array below a node, plus the two fields that name a metric
 * without placing it in one — an explorer tab's search box is fetched at runtime, so a
 * dev-tagged model behind it is just as live as a card. Other arrays carry unrelated ids.
 */
const collectMetricIds = (node, into) => {
  if (Array.isArray(node)) {
    node.forEach((entry) => collectMetricIds(entry, into));
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'metrics' && Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === 'string') into.add(entry);
        else if (entry && typeof entry === 'object' && typeof entry.id === 'string') {
          into.add(entry.id);
        }
      }
    }
    if (METRIC_REFERENCE_FIELDS.includes(key) && typeof value === 'string') {
      into.add(value);
    }
    collectMetricIds(value, into);
  }
};

// --- definitions -------------------------------------------------------------------------

const collectDefinitions = () => {
  const definitions = [];
  for (const file of fs.readdirSync(srcQueriesDir).sort()) {
    if (!file.endsWith('.js') || file === 'index.js') continue;
    const content = fs.readFileSync(path.join(srcQueriesDir, file), 'utf8');
    const id = readField(content, 'id') || file.replace(/\.js$/, '');
    const query = readField(content, 'query');
    if (!query) continue;

    const dbtRefs = new Set();
    for (const match of query.matchAll(/\b(?:FROM|JOIN)\s+dbt\.(\w+)/gi)) {
      dbtRefs.add(match[1]);
    }
    if (dbtRefs.size) definitions.push({ id, dbtRefs });
  }
  return definitions;
};

// --- main --------------------------------------------------------------------------------

(async () => {
  let manifest;
  let origin;
  try {
    const loaded = await loadManifestText();
    origin = loaded.origin;
    manifest = JSON.parse(loaded.text);
  } catch (error) {
    console.warn(`\nSkipped: could not load the dbt manifest (${error.message})`);
    console.warn('This check reads a public gh-pages artifact. Not treating it as a failure.\n');
    process.exit(0);
  }

  const relations = indexRelations(manifest);
  const generatedAt = manifest.metadata?.generated_at;
  const ageDays = generatedAt ? Math.floor((Date.now() - Date.parse(generatedAt)) / 86400000) : null;

  const definitions = collectDefinitions();
  const renderedIds = collectRenderedIds();

  const unknownModels = [];
  const devModels = [];
  const stagedDevModels = [];
  let referenceCount = 0;

  for (const def of definitions) {
    for (const ref of [...def.dbtRefs].sort()) {
      referenceCount += 1;
      const relation = relations.get(ref.toLowerCase());
      if (!relation) {
        unknownModels.push(`${def.id} -> dbt.${ref}`);
      } else if (relation.tags.has(DEV_TAG)) {
        const entry = `${def.id} -> dbt.${ref}`;
        if (renderedIds.has(def.id)) devModels.push(entry);
        else stagedDevModels.push(entry);
      }
    }
  }

  unknownModels.sort();
  devModels.sort();
  stagedDevModels.sort();

  if (updateMode) {
    writeAllow(
      'unknown-dbt-models.allow',
      unknownModels,
      '# Metrics reading a dbt relation absent from the published manifest.\n' +
        '# Either it was renamed or dropped upstream, or it is newer than the last\n' +
        '# gh-pages publish. See docs/lessons/upstream-rename-breaks-a-card.md'
    );
    writeAllow(
      'dev-tagged-dbt-models.allow',
      devModels,
      '# Rendered cards reading a model dbt tags `dev`. The production run builds\n' +
        '# tag:production and excludes tag:dev from docs, so no dbt test and no Elementary\n' +
        '# monitor covers these — the card can go wrong with nothing upstream noticing.\n' +
        '# Cards staged behind a disabled sector or tab are not listed: that is the correct\n' +
        '# way to hold a feature, and they fail this check when the sector is enabled.\n' +
        '# See docs/lessons/upstream-rename-breaks-a-card.md'
    );
    console.log('Ratchet files rewritten from current state.');
    process.exit(0);
  }

  const ratchets = [
    {
      label: 'Metrics reading a dbt relation that does not exist',
      allowFile: 'unknown-dbt-models.allow',
      current: unknownModels,
      hint: 'The card is empty in production. Point it at the current name, or add the model upstream first.',
    },
    {
      label: 'Rendered cards reading a model dbt tags as dev',
      allowFile: 'dev-tagged-dbt-models.allow',
      current: devModels,
      hint: 'No dbt test or Elementary monitor covers a dev model. Promote it to tag:production upstream, or stage the card behind `enabled: false` until it is.',
    },
  ];

  const failures = [];
  for (const { label, allowFile, current, hint } of ratchets) {
    const allowed = loadAllow(allowFile);
    const added = current.filter((entry) => !allowed.has(entry));
    const resolved = [...allowed].filter((entry) => !current.includes(entry)).sort();

    if (added.length) {
      failures.push([`${label} (new)`, added, `${hint}\n  Ratchet: scripts/allow/${allowFile}`]);
    }
    if (resolved.length) {
      failures.push([
        `${label} — no longer violations, remove from the ratchet`,
        resolved,
        `Run \`node scripts/check-dbt-contract.js --update\` to shrink scripts/allow/${allowFile}.`,
      ]);
    }
  }

  console.log(
    `Checked ${referenceCount} dbt references from ${definitions.length} metric queries ` +
      `against ${relations.size} dbt relations (${renderedIds.size} metric ids render)\n` +
      `  manifest from ${origin}, generated ${generatedAt || 'unknown'}` +
      `${ageDays === null ? '' : ` (${ageDays}d ago)`}`
  );

  if (stagedDevModels.length) {
    console.log(
      `  ${stagedDevModels.length} dev-tagged reference(s) staged behind a disabled sector or tab, ` +
        'which is the intended workflow:'
    );
    for (const entry of stagedDevModels) console.log(`    - ${entry}`);
    console.log('  These fail the check the moment that sector or tab is enabled.');
  }

  if (ageDays !== null && ageDays > STALE_MANIFEST_DAYS) {
    console.warn(
      `  Warning: the manifest is ${ageDays} days old, so a recent upstream rename may not appear here yet.`
    );
  }

  if (failures.length === 0) {
    console.log('All dbt contract checks passed');
    process.exit(0);
  }

  for (const [label, items, hint] of failures) {
    console.error(`\n${label} (${items.length}):`);
    for (const item of items) console.error(`  - ${item}`);
    console.error(`  ${hint}`);
  }
  console.error('');
  process.exit(1);
})();
