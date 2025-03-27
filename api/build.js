const { exec } = require('child_process');
const path = require('path');

// Run npm install in the api directory
exec('npm install', { cwd: path.join(__dirname) }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing API dependencies: ${error}`);
    return;
  }
  console.log(`API dependencies installed: ${stdout}`);
});