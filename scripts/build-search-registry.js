/**
 * Build-time search registry generator.
 *
 * Extracts lightweight search metadata (id, name, description, metricDescription)
 * from every metric file in src/queries and writes it to
 * public/search-registry.json. The frontend fetches this file once at startup so
 * the header search can match metrics by display name and description without
 * having to download ~500 lazy-loaded metric chunks first.
 *
 * Runs automatically before `dev` and `build` (see package.json scripts).
 *
 * Usage: node scripts/build-search-registry.js
 */

const fs = require('fs');
const path = require('path');

const srcQueriesDir = path.resolve(__dirname, '../src/queries');
const outputPath = path.resolve(__dirname, '../public/search-registry.json');

// Long markdown docs (methodology/glossary cards) are only needed for keyword
// matching, not display, so cap their contribution to keep the payload small.
const METRIC_DESCRIPTION_MAX_CHARS = 1500;

/**
 * Extract a string-literal field value from a metric file.
 * Handles ', " and ` delimiters (including multiline template literals) and
 * both bare (name:) and quoted ("name":) keys. The (?:^|[\s,{]) guard prevents
 * `description` from matching inside `metricDescription`.
 */
const extractField = (content, field) => {
  const re = new RegExp(
    `(?:^|[\\s,{])['"]?${field}['"]?\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`
  );
  const match = content.match(re);
  if (!match) return null;

  const delimiter = match[1];
  const value = match[2]
    .replace(new RegExp(`\\\\\\${delimiter}`, 'g'), delimiter)
    .replace(/\\n/g, '\n')
    .trim();
  return value || null;
};

const queryFiles = fs
  .readdirSync(srcQueriesDir)
  .filter((file) => file.endsWith('.js') && file !== 'index.js')
  .sort();

const registry = {};
let skippedCount = 0;

queryFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(srcQueriesDir, file), 'utf8');
  const id = extractField(content, 'id') || file.replace(/\.js$/, '');

  const name = extractField(content, 'name');
  const description = extractField(content, 'description');
  let metricDescription = extractField(content, 'metricDescription');
  if (metricDescription && metricDescription.length > METRIC_DESCRIPTION_MAX_CHARS) {
    metricDescription = metricDescription.slice(0, METRIC_DESCRIPTION_MAX_CHARS);
  }

  if (!name && !description && !metricDescription) {
    skippedCount++;
    return;
  }

  const entry = {};
  if (name) entry.name = name;
  if (description) entry.description = description;
  if (metricDescription) entry.metricDescription = metricDescription;
  registry[id] = entry;
});

fs.writeFileSync(outputPath, JSON.stringify(registry));

const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
console.log(
  `Search registry: ${Object.keys(registry).length} metrics written to ${path.relative(
    process.cwd(),
    outputPath
  )} (${sizeKb} KB, ${skippedCount} files without metadata skipped)`
);
