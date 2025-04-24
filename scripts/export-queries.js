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
queryFiles.forEach(file => {
  try {
    const filePath = path.join(srcQueriesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Skip any file that contains chartType: 'text'
    if (fileContent.includes("chartType: 'text'") || fileContent.includes('chartType: "text"')) {
      console.log(`Skipping text widget in file: ${file}`);
      return;
    }
    
    // Parse metric configuration using simple regex
    const idMatch = fileContent.match(/id:\s*['"]([^'"]+)['"]/);
    const queryMatch = fileContent.match(/query:\s*[`'"]([^`]+)[`'"]/s);
    
    if (!idMatch || !queryMatch) {
      console.warn(`Could not find ID or query in ${file}, skipping`);
      return;
    }
    
    const id = idMatch[1];
    const query = queryMatch[1].trim();
    
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