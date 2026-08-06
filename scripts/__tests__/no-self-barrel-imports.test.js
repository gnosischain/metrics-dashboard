// @vitest-environment node
/**
 * A module that its own directory's index.js imports must not import from that index.
 *
 * This is the cycle that cost the suite MetricWidget.test.jsx for months: entering the
 * barrel from inside it means one import awaits the other, so a module-level throw anywhere
 * in the barrel never surfaces — the import promise simply never settles, and no timeout
 * applies to a module that is still loading. See docs/lessons/barrel-import-cycle-hangs-tests.md
 *
 * The hang itself is no longer the alarm: the canvas stub in src/test/setupTests.js removed
 * the throw that made the cycle fatal, so a reintroduced cycle would now be silent until the
 * next module-level throw finds it. Hence a static check.
 *
 * Scoped to modules the barrel actually imports, so a test file or a consumer importing
 * `./index` stays legal — that is what a barrel is for.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, '../../src');

const BARREL_NAMES = ['index.js', 'index.jsx'];
const SOURCE_EXTENSIONS = ['.js', '.jsx'];

/** `import x from '...'`, `export { x } from '...'`, `import '...'`. */
const importSpecifiers = (content) => {
  const specifiers = [];
  for (const match of content.matchAll(/(?:^|\n)\s*(?:import|export)\b[\s\S]*?['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1]);
  }
  return specifiers.filter((specifier) => specifier.startsWith('.'));
};

const resolveModule = (fromDir, specifier) => {
  const base = path.resolve(fromDir, specifier);
  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...BARREL_NAMES.map((name) => path.join(base, name)),
  ];
  return (
    candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ||
    null
  );
};

const findBarrels = (dir) => {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findBarrels(full));
    } else if (BARREL_NAMES.includes(entry.name)) {
      found.push(full);
    }
  }
  return found;
};

describe('barrel imports', () => {
  it('no module imports the barrel that imports it', () => {
    const violations = [];

    for (const barrel of findBarrels(srcDir)) {
      const barrelDir = path.dirname(barrel);
      const barrelContent = fs.readFileSync(barrel, 'utf8');

      for (const specifier of importSpecifiers(barrelContent)) {
        const member = resolveModule(barrelDir, specifier);
        if (!member || member === barrel) continue;

        const memberDir = path.dirname(member);
        for (const memberSpecifier of importSpecifiers(fs.readFileSync(member, 'utf8'))) {
          if (resolveModule(memberDir, memberSpecifier) === barrel) {
            violations.push(
              `${path.relative(srcDir, member)} imports '${memberSpecifier}', ` +
                `which is ${path.relative(srcDir, barrel)} — and that barrel imports it back`
            );
          }
        }
      }
    }

    expect(
      violations,
      `Import the sibling modules directly instead.\n  ${violations.join('\n  ')}\n` +
        '  See docs/lessons/barrel-import-cycle-hangs-tests.md'
    ).toEqual([]);
  });
});
