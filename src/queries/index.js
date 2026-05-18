/**
 * Lazy query loader
 *
 * Each metric definition under this directory is exposed as a dynamic
 * importer keyed by id (filename without extension). Modules are evaluated
 * only when requested via `queryLoaders.get(id)()`, which lets Vite split
 * them out of the initial bundle.
 */

const queryModules = import.meta.glob('./*.js');

const idFromPath = (path) => path.replace(/^\.\//, '').replace(/\.js$/, '');

const queryLoaders = new Map();
const queryIds = [];

Object.entries(queryModules)
  .filter(([path]) => !path.endsWith('/index.js'))
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .forEach(([path, loader]) => {
    const id = idFromPath(path);
    queryLoaders.set(id, async () => {
      const mod = await loader();
      return mod?.default;
    });
    queryIds.push(id);
  });

if (import.meta.env?.VITE_DEBUG_METRICS === 'true') {
  console.log(`Registered ${queryIds.length} metric query loaders (lazy)`);
}

export { queryLoaders, queryIds };
