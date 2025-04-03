/**
 * Dynamic query loader
 * 
 * This file automatically imports all metric definitions from the current directory
 * and exports them as an array.
 */

// Use webpack require.context to dynamically import all files in this directory
// excluding this index.js file itself
const requireContext = require.context('./', false, /\.js$/);
const queryModules = requireContext.keys()
  .filter(key => key !== './index.js')  // Exclude this file
  .map(key => requireContext(key).default); // Get the default export from each file

console.log(`Loaded ${queryModules.length} metric queries dynamically`);

export default queryModules;