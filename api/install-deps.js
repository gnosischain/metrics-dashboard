const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// This script installs dependencies for the API
try {
  console.log('Installing API dependencies...');
  console.log('Current directory:', __dirname);
  console.log('Files in current directory:', fs.readdirSync(__dirname));

  // Force clean install
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('Removing existing node_modules...');
    fs.rmSync(path.join(__dirname, 'node_modules'), { recursive: true, force: true });
  }

  if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
    console.log('Removing existing package-lock.json...');
    fs.unlinkSync(path.join(__dirname, 'package-lock.json'));
  }

  // Install with --no-save to ensure we don't modify package.json during install
  execSync('npm install --no-save', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('API dependencies installed successfully');
  
  // Verify axios installation specifically
  const axiosDir = path.join(__dirname, 'node_modules', 'axios');
  if (fs.existsSync(axiosDir)) {
    console.log('✓ axios module directory found');
    console.log('axios directory contents:', fs.readdirSync(axiosDir));
    
    const distDir = path.join(axiosDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log('axios/dist directory contents:', fs.readdirSync(distDir));
    }
  } else {
    console.error('× axios module directory not found!');
  }
  
  // List installed modules to verify
  const modulesDir = path.join(__dirname, 'node_modules');
  if (fs.existsSync(modulesDir)) {
    const modules = fs.readdirSync(modulesDir);
    console.log(`Top-level installed modules: ${modules.join(', ')}`);
  } else {
    console.error('× node_modules directory not found!');
  }
} catch (error) {
  console.error('Error installing API dependencies:', error.message);
  process.exit(1);
}