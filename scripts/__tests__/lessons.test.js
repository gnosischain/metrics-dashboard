// @vitest-environment node
/**
 * Schema validator for docs/lessons. A corpus nobody trusts is worse than no corpus, so the
 * rules that make a record trustworthy — evidence, a real symptom, a verification date, an
 * index entry — are enforced rather than requested.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const lessonsDir = path.resolve(here, '../../docs/lessons');
const indexFile = path.join(lessonsDir, 'INDEX.md');

const STATUSES = ['observed', 'remediated', 'enforced'];
const LAYERS = [
  'query-definition',
  'layout-config',
  'widget-ui',
  'client-data',
  'serverless-api',
  'build-pipeline',
  'test-suite',
];
const REQUIRED_SECTIONS = [
  'Symptom',
  'Root cause',
  'Forbidden action',
  'Detection',
  'Safe remediation',
  'Enforcement',
];
const REQUIRED_KEYS = ['id', 'title', 'status', 'layer', 'scope', 'symptom', 'last_verified', 'evidence'];

// Long enough that a stable record is not busywork, short enough that nothing silently
// becomes folklore.
const MAX_AGE_DAYS = 400;

const lessonFiles = fs
  .readdirSync(lessonsDir)
  .filter((file) => file.endsWith('.md') && file !== 'INDEX.md')
  .sort();

const parse = (file) => {
  const raw = fs.readFileSync(path.join(lessonsDir, file), 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: raw };
  return { frontmatter: yaml.load(match[1]), body: match[2] };
};

describe('lessons corpus', () => {
  it('has at least one record', () => {
    expect(lessonFiles.length).toBeGreaterThan(0);
  });

  describe.each(lessonFiles)('%s', (file) => {
    const { frontmatter, body } = parse(file);

    it('opens with parseable YAML frontmatter', () => {
      expect(frontmatter, `${file} has no --- frontmatter block`).toBeTruthy();
    });

    it('declares every required key', () => {
      const missing = REQUIRED_KEYS.filter((key) => frontmatter?.[key] === undefined);
      expect(missing, `${file} is missing ${missing.join(', ')}`).toEqual([]);
    });

    it('has an id matching its filename', () => {
      expect(frontmatter?.id).toBe(file.replace(/\.md$/, ''));
    });

    it('uses a known status and layer', () => {
      expect(STATUSES).toContain(frontmatter?.status);
      expect(LAYERS).toContain(frontmatter?.layer);
    });

    it('cites at least one piece of evidence', () => {
      expect(Array.isArray(frontmatter?.evidence)).toBe(true);
      expect(frontmatter?.evidence.length).toBeGreaterThan(0);
      for (const item of frontmatter.evidence) {
        expect(typeof item).toBe('string');
        expect(item.trim().length).toBeGreaterThan(0);
      }
    });

    it('states a symptom in more than a few words', () => {
      // A one-liner here is the failure mode: records are found by symptom, so a stub
      // symptom makes the record unfindable by the only person who needs it.
      expect(String(frontmatter?.symptom).trim().length).toBeGreaterThan(40);
    });

    it('carries a last_verified date that is real, not future, and not stale', () => {
      const value = frontmatter?.last_verified;
      const date = value instanceof Date ? value : new Date(String(value));
      expect(Number.isNaN(date.getTime()), `${file} last_verified is unparseable`).toBe(false);

      const ageDays = (Date.now() - date.getTime()) / 86_400_000;
      expect(ageDays, `${file} last_verified is in the future`).toBeGreaterThan(-1);
      expect(
        ageDays,
        `${file} was last verified ${Math.round(ageDays)} days ago — re-verify and bump the ` +
          'date, or delete the record (docs/workflows/incident.md)'
      ).toBeLessThan(MAX_AGE_DAYS);
    });

    it('contains the six required sections in order', () => {
      const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
      expect(headings).toEqual(REQUIRED_SECTIONS);
    });

    it('is listed in INDEX.md', () => {
      const index = fs.readFileSync(indexFile, 'utf8');
      expect(index).toContain(`(${file})`);
    });
  });

  it('has no INDEX.md links pointing at missing records', () => {
    const index = fs.readFileSync(indexFile, 'utf8');
    const linked = [...index.matchAll(/\(([a-z0-9-]+\.md)\)/g)].map((m) => m[1]);
    const dangling = [...new Set(linked)].filter((name) => !lessonFiles.includes(name));
    expect(dangling, `INDEX.md links records that do not exist: ${dangling.join(', ')}`).toEqual([]);
  });
});
