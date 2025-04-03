/**
 * Script to export query definitions from frontend to API proxy
 * 
 * A simplified version that directly requires the JS modules and extracts the id and query.
 * 
 * Usage: node scripts/export-queries.js
 */

const fs = require('fs');
const path = require('path');

// Directory paths
const srcQueriesDir = path.resolve(__dirname, '../src/queries');
const apiQueriesDir = path.resolve(__dirname, '../api/queries');

// Ensure the api/queries directory exists
if (!fs.existsSync(apiQueriesDir)) {
  console.log(`Creating directory: ${apiQueriesDir}`);
  fs.mkdirSync(apiQueriesDir, { recursive: true });
}

// Find all JavaScript files in the src/queries directory (excluding index.js and template files)
const queryFiles = fs.readdirSync(srcQueriesDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js' && !file.includes('template'));

console.log(`Found ${queryFiles.length} query definitions to export`);

// Process each query file by directly requiring it
queryFiles.forEach(file => {
  const filePath = path.join(srcQueriesDir, file);
  const fileName = path.basename(file, '.js');
  
  try {
    // Use a cleaner approach - directly require the module
    // This assumes all metric files use module.exports or export default
    const relativePath = '../src/queries/' + fileName;
    
    // Delete the module from cache if it exists
    delete require.cache[require.resolve(relativePath)];
    
    // Directly require the metric module
    const metricModule = require(relativePath);
    const metricConfig = metricModule.default || metricModule;
    
    // Extract the id and query from the loaded module
    if (!metricConfig || !metricConfig.id || !metricConfig.query) {
      console.error(`Missing id or query in ${file}`);
      console.log('Metric structure:', JSON.stringify(metricConfig, null, 2));
      return;
    }
    
    const { id, query } = metricConfig;
    
    // Create a simplified JSON object with just id and query
    const jsonObj = { id, query };
    
    // Write to the api/queries directory
    const outputPath = path.join(apiQueriesDir, `${id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jsonObj, null, 2));
    
    console.log(`Exported ${id} to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
});

console.log('Query export complete!');