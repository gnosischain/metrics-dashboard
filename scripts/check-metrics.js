/**
 * Consistency checks across the three places a metric has to be registered:
 *
 *   src/queries/<id>.js        the definition (authored)
 *   public/dashboards/*.yml    the placement — a metric absent here renders nowhere
 *   api/queries/<id>.json      the SQL production actually executes
 *
 * Export parity is checked by `export-queries.js --check`; this covers the rest.
 *
 * Rules with pre-existing violations carry a ratchet file under scripts/allow/. Listed
 * entries pass, anything new fails, and an entry that is no longer a violation also fails
 * so the list can only shrink.
 *
 * Usage:
 *   node scripts/check-metrics.js             report violations, exit 1 if any
 *   node scripts/check-metrics.js --update    rewrite the ratchet files from current state
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..');
const srcQueriesDir = path.join(repoRoot, 'src/queries');
const dashboardsDir = path.join(repoRoot, 'public/dashboards');
const rootDashboardFile = path.join(repoRoot, 'public/dashboard.yml');
const allowDir = path.join(__dirname, 'allow');

const updateMode = process.argv.includes('--update');

// Layout-only entries that never resolve to a metric definition.
const PSEUDO_METRIC_IDS = new Set(['global_filter']);

// Only dbt.api_* is a declared contract surface. See docs/lessons/non-contract-dbt-reads.md
const CONTRACT_PREFIX = 'api_';

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

// --- gather definitions ------------------------------------------------------------------

const definitions = [];
for (const file of fs.readdirSync(srcQueriesDir).sort()) {
  if (!file.endsWith('.js') || file === 'index.js') continue;
  const content = fs.readFileSync(path.join(srcQueriesDir, file), 'utf8');
  const stem = file.replace(/\.js$/, '');
  const id = readField(content, 'id') || stem;
  const query = readField(content, 'query');
  const isText = /chartType['"]?\s*:\s*['"]text['"]/.test(content);

  const dbtRefs = new Set();
  if (query) {
    for (const match of query.matchAll(/\b(?:FROM|JOIN)\s+dbt\.(\w+)/gi)) {
      dbtRefs.add(match[1]);
    }
  }

  definitions.push({ file, stem, id, isText, hasQuery: Boolean(query), dbtRefs });
}

const definitionsById = new Map();
const duplicateIds = [];
for (const def of definitions) {
  if (definitionsById.has(def.id)) {
    duplicateIds.push(`${def.id} (${definitionsById.get(def.id).file} and ${def.file})`);
  } else {
    definitionsById.set(def.id, def);
  }
}

// --- gather placements -------------------------------------------------------------------

const placedIds = new Set();

// Only ids under a `metrics:` array are metric placements. Other arrays carry their own ids
// that have nothing to do with src/queries — `chains:` in dashboard.yml being the example.
const collectIds = (node) => {
  if (Array.isArray(node)) {
    node.forEach(collectIds);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'metrics' && Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === 'string') placedIds.add(entry);
        else if (entry && typeof entry === 'object' && typeof entry.id === 'string') {
          placedIds.add(entry.id);
        }
      }
    }
    collectIds(value);
  }
};

const yamlFiles = [rootDashboardFile];
if (fs.existsSync(dashboardsDir)) {
  for (const file of fs.readdirSync(dashboardsDir).sort()) {
    if (/\.ya?ml$/.test(file)) yamlFiles.push(path.join(dashboardsDir, file));
  }
}

const yamlErrors = [];
for (const file of yamlFiles) {
  if (!fs.existsSync(file)) {
    yamlErrors.push(`${path.relative(repoRoot, file)} is missing`);
    continue;
  }
  try {
    collectIds(yaml.load(fs.readFileSync(file, 'utf8')));
  } catch (error) {
    yamlErrors.push(`${path.relative(repoRoot, file)}: ${error.message}`);
  }
}

// --- evaluate rules ---------------------------------------------------------------------

const danglingPlacements = [...placedIds]
  .filter((id) => !PSEUDO_METRIC_IDS.has(id) && !definitionsById.has(id))
  .sort();

const unplaced = definitions.filter((def) => !placedIds.has(def.id)).map((def) => def.id).sort();

const idMismatches = definitions
  .filter((def) => def.id !== def.stem)
  .map((def) => `${def.file} -> ${def.id}`)
  .sort();

const nonContractReads = definitions
  .filter((def) => [...def.dbtRefs].some((ref) => !ref.startsWith(CONTRACT_PREFIX)))
  .map((def) => def.id)
  .sort();

if (updateMode) {
  writeAllow(
    'unplaced-metrics.allow',
    unplaced,
    '# Metric definitions not placed in any dashboard YAML.\n' +
      '# They render nowhere and are absent from header search.\n' +
      '# See docs/lessons/yaml-placement-gate.md'
  );
  writeAllow(
    'id-filename-mismatch.allow',
    idMismatches,
    '# Definitions whose exported id differs from their filename.\n' +
      '# You cannot find these by filename when an upstream model is renamed.\n' +
      '# See docs/lessons/id-does-not-name-the-table.md'
  );
  writeAllow(
    'non-contract-dbt-reads.allow',
    nonContractReads,
    '# Metrics reading dbt.int_* / dbt.fct_* instead of the contracted dbt.api_* layer.\n' +
      '# These feature areas have no api_ model; dbt is free to move everything else.\n' +
      '# See docs/lessons/non-contract-dbt-reads.md'
  );
  console.log('Ratchet files rewritten from current state.');
  process.exit(0);
}

const ratchets = [
  {
    label: 'Metric definitions not placed in any dashboard YAML',
    allowFile: 'unplaced-metrics.allow',
    current: unplaced,
    hint: 'Place it in public/dashboards/<sector>.yml, or add it to the allow file if it is intentionally unrendered.',
  },
  {
    label: 'Definitions whose id differs from their filename',
    allowFile: 'id-filename-mismatch.allow',
    current: idMismatches,
    hint: 'Name the file after the id so the metric is findable when its upstream model is renamed.',
  },
  {
    label: 'Metrics reading dbt.int_* / dbt.fct_* instead of dbt.api_*',
    allowFile: 'non-contract-dbt-reads.allow',
    current: nonContractReads,
    hint: 'Read the contracted dbt.api_* layer, or add an api_ model upstream first.',
  },
];

const failures = [];

if (yamlErrors.length) {
  failures.push(['Dashboard YAML could not be read', yamlErrors, 'Fix the YAML before anything else.']);
}

if (duplicateIds.length) {
  failures.push([
    'Two definitions export the same id',
    duplicateIds,
    'One silently shadows the other in src/queries/index.js. Rename one.',
  ]);
}

if (danglingPlacements.length) {
  failures.push([
    'Dashboard YAML references ids with no definition',
    danglingPlacements,
    'The card renders empty. Remove the placement or add the definition.',
  ]);
}

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
      `Run \`node scripts/check-metrics.js --update\` to shrink scripts/allow/${allowFile}.`,
    ]);
  }
}

console.log(
  `Checked ${definitions.length} definitions against ${yamlFiles.length} dashboard YAML files ` +
    `(${placedIds.size} placed ids)`
);

if (failures.length === 0) {
  console.log('All metric registration checks passed');
  process.exit(0);
}

for (const [label, items, hint] of failures) {
  console.error(`\n${label} (${items.length}):`);
  for (const item of items) console.error(`  - ${item}`);
  console.error(`  ${hint}`);
}
console.error('');
process.exit(1);
