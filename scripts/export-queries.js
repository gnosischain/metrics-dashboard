/**
 * Script to export query definitions from frontend to API proxy
 * Only exports metrics with actual queries, skipping text widgets
 * 
 * Usage: node scripts/export-queries.js
 */

const fs = require('fs');
const path = require('path');

// Directory paths
const srcQueriesDir = path.resolve(__dirname, '../src/queries');
const apiQueriesDir = path.resolve(__dirname, '../api/queries');
const inlineFilterMarker = '/*__FILTER_CONDITIONS__*/';

const scopedPrefixRequiresInlineFilter = [
  'api_execution_account_',
  'api_execution_circles_v2_avatar_',
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
  console.log(`Creating directory: ${apiQueriesDir}`);
  fs.mkdirSync(apiQueriesDir, { recursive: true });
}

// Find all JavaScript files in the queries directory
const queryFiles = fs.readdirSync(srcQueriesDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

console.log(`Found ${queryFiles.length} metric files to process`);

// Process each query file
let exportedCount = 0;
const inlineFilterWarnings = [];
queryFiles.forEach(file => {
  try {
    const filePath = path.join(srcQueriesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Skip any file that contains chartType: 'text'
    if (fileContent.includes("chartType: 'text'") || fileContent.includes('chartType: "text"')) {
      console.log(`Skipping text widget in file: ${file}`);
      return;
    }
    
    // Parse metric configuration using delimiter-aware regex
    const idMatch = fileContent.match(/id:\s*['"]([^'"]+)['"]/);
    const queryMatch = fileContent.match(/query:\s*([`'"])((?:\\.|(?!\1)[\s\S])*?)\1/s);
    
    if (!idMatch || !queryMatch) {
      console.warn(`Could not find ID or query in ${file}, skipping`);
      return;
    }
    
    const id = idMatch[1];
    const delimiter = queryMatch[1];
    let query = queryMatch[2].trim();

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
    
    // Create a JSON object with just id and query
    const jsonObj = { id, query };
    
    // Write to the api/queries directory
    const outputPath = path.join(apiQueriesDir, `${id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jsonObj, null, 2));
    
    exportedCount++;
    console.log(`Exported ${id} to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log(`Query export complete! Exported ${exportedCount} queries`);

if (inlineFilterWarnings.length > 0) {
  console.error(
    `Scoped query export failed: ${inlineFilterWarnings.length} query files are missing ${inlineFilterMarker}:\n` +
      inlineFilterWarnings.map((entry) => `  - ${entry}`).join('\n')
  );
  process.exitCode = 1;
}
