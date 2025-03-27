/**
 * Script to export query definitions from frontend to API proxy
 * 
 * This script reads all query definitions from the src/queries directory,
 * extracts the query information, and exports them to the api/queries directory
 * as JSON files that can be loaded by the API proxy.
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

// Find all JavaScript files in the src/queries directory (excluding index.js and README.md)
const queryFiles = fs.readdirSync(srcQueriesDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

console.log(`Found ${queryFiles.length} query definitions to export`);

// Process each query file
queryFiles.forEach(file => {
  const filePath = path.join(srcQueriesDir, file);
  
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the query object using regex
    // This pattern matches both direct exports and variable exports
    const exportMatch = content.match(/export\s+default\s+({[\s\S]*?});?\s*$/) || 
                        content.match(/const\s+\w+\s*=\s*({[\s\S]*?});\s*export\s+default/);
    
    if (!exportMatch) {
      console.error(`Could not find export in ${file}`);
      return;
    }
    
    // Get the object literal as a string
    const objectStr = exportMatch[1];
    
    // Convert to a proper JavaScript object using eval (safe in this controlled context)
    // eslint-disable-next-line no-eval
    const queryObj = eval(`(${objectStr})`);
    
    // Create a simplified JSON object with just id and query
    const jsonObj = {
      id: queryObj.id,
      query: queryObj.query
    };
    
    // Write to the api/queries directory
    const outputPath = path.join(apiQueriesDir, `${queryObj.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jsonObj, null, 2));
    
    console.log(`Exported ${queryObj.id} to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log('Query export complete!');