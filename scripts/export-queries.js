/**
 * Script to export query definitions from frontend to API proxy
 * Only exports metrics with actual queries, skipping text widgets
 *
 * Usage:
 *   node scripts/export-queries.js            write api/queries/*.json
 *   node scripts/export-queries.js --check    report drift, write nothing, exit 1 if stale
 */

const fs = require('fs');
const path = require('path');

// Directory paths
const srcQueriesDir = path.resolve(__dirname, '../src/queries');
const apiQueriesDir = path.resolve(__dirname, '../api/queries');
const inlineFilterMarker = '/*__FILTER_CONDITIONS__*/';

const checkOnly = process.argv.includes('--check');

// Source files are checked out with CRLF wherever git's core.autocrlf is on, and the query
// regex captures the file's bytes verbatim — so without this the platform's line endings end
// up escaped inside the JSON "query" value. That is data, not file line endings, so neither
// .gitattributes nor git's own normalisation can undo it. See docs/lessons/crlf-export-drift.md
const normalizeNewlines = (value) => value.replace(/\r\n?/g, '\n');

const serializeQuery = (id, query) => JSON.stringify({ id, query }, null, 2);

// Hand-maintained JSON carries a trailing newline, JSON.stringify does not. Comparing trimmed
// keeps that cosmetic difference from masking a real SQL change.
const sameContent = (a, b) => a.trimEnd() === b.trimEnd();

const scopedPrefixRequiresInlineFilter = [
  'api_execution_account_',
  'api_execution_circles_v2_avatar_',
  'api_execution_circles_v2_group_explorer_',
  'api_execution_circles_v2_pool_explorer_',
  'api_execution_gnosis_app_user_',
  'api_execution_gpay_user_',
  'api_execution_yields_user_',
  'api_consensus_validators_explorer_',
];

const serviceScopedPrefixRequiresInlineFilter = [
  'api_consensus_validator_compare_',
  'api_consensus_validator_group_',
  'api_consensus_validator_history_',
  'api_consensus_validator_profile_',
];

const scopedIdsRequiringInlineFilter = new Set([
  'api_execution_address_resolver',
]);

const scopedInlineFilterExceptions = new Set([
  'api_execution_gpay_user_top_wallets',
  'api_execution_yields_user_top_wallets',
]);

const requiresInlineFilter = (id, fileContent) => {
  if (scopedInlineFilterExceptions.has(id)) return false;
  if (scopedIdsRequiringInlineFilter.has(id)) return true;
  if (serviceScopedPrefixRequiresInlineFilter.some((prefix) => id.startsWith(prefix))) return true;
  const isKnownScopedMetric = scopedPrefixRequiresInlineFilter.some((prefix) => id.startsWith(prefix));
  return isKnownScopedMetric && fileContent.includes('globalFilterField');
};

// Ensure the api/queries directory exists
if (!fs.existsSync(apiQueriesDir)) {
  if (checkOnly) {
    console.error(`Missing directory: ${apiQueriesDir}`);
    process.exit(1);
  }
  console.log(`Creating directory: ${apiQueriesDir}`);
  fs.mkdirSync(apiQueriesDir, { recursive: true });
}

// Find all JavaScript files in the queries directory
const queryFiles = fs.readdirSync(srcQueriesDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

console.log(`Found ${queryFiles.length} metric files to process`);

// Process each query file
const inlineFilterWarnings = [];
const unparseable = [];
const missing = [];
const stale = [];
let exportedCount = 0;

// Keyed on the SOURCE FILE existing (id === filename by convention), NOT on what parsed/exported
// this run — some cards use JSON-style keys the exporter can't parse but whose JSON is committed.
const liveIds = new Set();

queryFiles.forEach(file => {
  try {
    const filePath = path.join(srcQueriesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    liveIds.add(file.replace(/\.js$/, ''));

    // Parse metric configuration using delimiter-aware regex. Both bare (`id:`) and JSON-style
    // (`"id":`) keys are in use across src/queries; the leading boundary keeps a key such as
    // "chart_id" from being read as "id".
    const idMatch = fileContent.match(/(?:^|[{,\s])["']?id["']?\s*:\s*['"]([^'"]+)['"]/);
    if (idMatch) liveIds.add(idMatch[1]);

    // Skip any file that contains chartType: 'text'
    if (fileContent.includes("chartType: 'text'") || fileContent.includes('chartType: "text"')) {
      return;
    }

    const queryMatch = fileContent.match(/(?:^|[{,\s])["']?query["']?\s*:\s*([`'"])((?:\\.|(?!\1)[\s\S])*?)\1/s);

    if (!idMatch || !queryMatch) {
      unparseable.push(file);
      return;
    }

    const id = idMatch[1];
    const delimiter = queryMatch[1];
    let query = normalizeNewlines(queryMatch[2].trim());

    if (requiresInlineFilter(id, fileContent) && !query.includes(inlineFilterMarker)) {
      inlineFilterWarnings.push(`${id} (${file})`);
    }

    // Unescape escaped delimiters from source literals
    if (delimiter === '`') {
      query = query.replace(/\\`/g, '`');
    } else if (delimiter === '\'') {
      query = query.replace(/\\'/g, '\'');
    } else if (delimiter === '"') {
      query = query.replace(/\\"/g, '"');
    }

    const desired = serializeQuery(id, query);
    const outputPath = path.join(apiQueriesDir, `${id}.json`);
    const existing = fs.existsSync(outputPath)
      ? normalizeNewlines(fs.readFileSync(outputPath, 'utf8'))
      : null;

    const needsWrite = existing === null || !sameContent(existing, desired);

    if (existing === null) {
      missing.push(id);
    } else if (needsWrite) {
      stale.push(id);
    }

    if (!checkOnly && needsWrite) {
      const trailing = existing !== null && existing.endsWith('\n') ? '\n' : '';
      fs.writeFileSync(outputPath, desired + trailing);
      exportedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    process.exitCode = 1;
  }
});

// --- Prune stale outputs: remove api/queries/<id>.json with no source src/queries/<id>.js ---
const orphans = fs.readdirSync(apiQueriesDir)
  .filter((f) => f.endsWith('.json'))
  .filter((f) => !liveIds.has(f.replace(/\.json$/, '')));

if (!checkOnly) {
  for (const jsonFile of orphans) {
    fs.unlinkSync(path.join(apiQueriesDir, jsonFile));
    console.log(`Pruned stale query ${jsonFile}`);
  }
  console.log(`Query export complete! Wrote ${exportedCount}, pruned ${orphans.length}`);
} else {
  const report = (label, items) => {
    if (items.length === 0) return;
    console.error(`${label} (${items.length}):`);
    for (const item of items) console.error(`  - ${item}`);
  };

  report('Missing from api/queries', missing);
  report('Stale in api/queries', stale);
  report('Orphaned in api/queries', orphans);

  if (missing.length || stale.length || orphans.length) {
    console.error(
      '\napi/queries is out of sync with src/queries. Run `pnpm run export-queries` and commit the result.\n' +
        'The API executes api/queries/*.json, so until you do, production runs the old SQL with no error.\n' +
        'See docs/lessons/export-queries-drift.md'
    );
    process.exitCode = 1;
  } else {
    console.log('api/queries is in sync with src/queries');
  }
}

if (unparseable.length > 0) {
  console.warn(
    `Could not parse id/query in ${unparseable.length} file(s); their committed JSON is left untouched:\n` +
      unparseable.map((entry) => `  - ${entry}`).join('\n')
  );
}

if (inlineFilterWarnings.length > 0) {
  console.error(
    `Scoped query export failed: ${inlineFilterWarnings.length} query files are missing ${inlineFilterMarker}:\n` +
      inlineFilterWarnings.map((entry) => `  - ${entry}`).join('\n')
  );
  process.exitCode = 1;
}
