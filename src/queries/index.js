/**
 * Dynamic query loader
 * 
 * This file automatically imports all metric definitions from the current directory
 * and exports them as an array.
 */

// Use Vite's import.meta.glob to dynamically import all files in this directory
// excluding this index.js file itself
const modules = import.meta.glob('./*.js', { eager: true });

const queryModules = Object.entries(modules)
  .filter(([key]) => key !== './index.js')  // Exclude this file
  .map(([, module]) => module.default)       // Get the default export from each file
  .filter(Boolean);                          // Filter out any undefined exports

console.log(`Loaded ${queryModules.length} metric queries dynamically`);

export default queryModules;