/**
 * Dynamic query loader
 * 
 * This file automatically imports all metric definitions from the current directory
 * and exports them as an array.
 */

const queryModuleEntries = Object.entries(
  import.meta.glob('./*.js', { eager: true })
)
  .filter(([path]) => !path.endsWith('/index.js'))
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath));

const queryModules = queryModuleEntries
  .map(([, moduleExports]) => moduleExports?.default)
  .filter(Boolean);

console.log(`Loaded ${queryModules.length} metric queries dynamically`);

export default queryModules;
