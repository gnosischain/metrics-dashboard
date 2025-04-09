const fs = require('fs');
const path = require('path');

// Source and destination paths
const srcPath = path.resolve(__dirname, '../src/config/dashboard.yml');
const destPath = path.resolve(__dirname, '../public/dashboard.yml');

// Create directories if they don't exist
const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Check if source file exists
if (!fs.existsSync(srcPath)) {
  console.error(`Source file not found: ${srcPath}`);
  process.exit(1);
}

// Copy the file
try {
  fs.copyFileSync(srcPath, destPath);
  console.log(`Dashboard configuration copied to: ${destPath}`);
} catch (error) {
  console.error(`Error copying dashboard configuration: ${error}`);
  process.exit(1);
}