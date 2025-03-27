const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// This script installs dependencies for the API
try {
  console.log('Installing API dependencies...');
  execSync('npm install', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('API dependencies installed successfully');
  
  // List installed modules to verify
  const modulesDir = path.join(__dirname, 'node_modules');
  if (fs.existsSync(modulesDir)) {
    const modules = fs.readdirSync(modulesDir);
    console.log(`Installed modules: ${modules.join(', ')}`);
    
    // Check for axios specifically
    if (modules.includes('axios')) {
      console.log('✓ axios module found');
    } else {
      console.error('× axios module not found!');
    }
  } else {
    console.error('× node_modules directory not found!');
  }
} catch (error) {
  console.error('Error installing API dependencies:', error.message);
  process.exit(1);
}