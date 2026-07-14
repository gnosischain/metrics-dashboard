import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const cacheManager = require('./cache');

describe('cacheManager.queryHash', () => {
  it('is stable for the same query', () => {
    expect(cacheManager.queryHash('SELECT 1')).toBe(cacheManager.queryHash('SELECT 1'));
  });

  it('changes when the query text changes', () => {
    // e.g. the trust-degree ordering fix: same metric, different ORDER BY
    expect(cacheManager.queryHash('SELECT x FROM t ORDER BY trust_bucket'))
      .not.toBe(cacheManager.queryHash('SELECT x FROM t ORDER BY multiIf(trust_bucket=\'0\',0,1)'));
  });

  it('returns a short hex digest and handles empty/missing input', () => {
    expect(cacheManager.queryHash('SELECT 1')).toMatch(/^[0-9a-f]{12}$/);
    expect(cacheManager.queryHash('')).toBe('0');
    expect(cacheManager.queryHash(undefined)).toBe('0');
    expect(cacheManager.queryHash(null)).toBe('0');
  });
});

describe('query-hashed cache key invalidates on query edit', () => {
  const metricId = '__test_query_hash_invalidation__';
  const keyFor = (q) => `${metricId}|q=${cacheManager.queryHash(q)}`;

  it('editing a card query yields a cache miss (fresh fetch) without manual clearing', () => {
    const oldQuery = 'SELECT date, value FROM t ORDER BY value';
    const newQuery = 'SELECT date, value FROM t ORDER BY date'; // query was edited

    cacheManager.clearCache(keyFor(oldQuery));
    cacheManager.clearCache(keyFor(newQuery));

    // Old query result is cached under the old key.
    cacheManager.setCache(keyFor(oldQuery), [{ v: 1 }]);
    expect(cacheManager.getCache(keyFor(oldQuery))).toEqual([{ v: 1 }]);

    // The edited query hashes differently -> different key -> cache MISS,
    // so the request path fetches fresh data instead of serving the stale result.
    expect(cacheManager.getCache(keyFor(newQuery))).toBeNull();

    cacheManager.clearCache(keyFor(oldQuery));
  });
});
