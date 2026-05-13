import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('../queries', () => {
  const loaders = new Map();
  const calls = { count: {} };
  const register = (id, config) => {
    loaders.set(id, vi.fn(async () => {
      calls.count[id] = (calls.count[id] || 0) + 1;
      return config;
    }));
  };
  register('alpha', { id: 'alpha', name: 'Alpha' });
  register('beta', { id: 'beta', name: 'Beta' });
  register('gamma', { id: 'gamma', name: 'Gamma' });
  return { queryLoaders: loaders, queryIds: ['alpha', 'beta', 'gamma'], __calls: calls };
});

// Import after the mock is registered.
let metricsService;
let mockQueries;
beforeEach(async () => {
  vi.resetModules();
  metricsService = (await import('./metrics')).default;
  mockQueries = await import('../queries');
});

describe('MetricsService.loadMetricConfigs', () => {
  it('populates the cache and exposes configs synchronously via getMetricConfig', async () => {
    await metricsService.loadMetricConfigs(['alpha']);
    expect(metricsService.getMetricConfig('alpha')).toEqual({ id: 'alpha', name: 'Alpha' });
    expect(metricsService.getMetricConfig('beta')).toBeUndefined();
  });

  it('deduplicates concurrent loads for the same id', async () => {
    await Promise.all([
      metricsService.loadMetricConfigs(['beta']),
      metricsService.loadMetricConfigs(['beta'])
    ]);
    expect(mockQueries.__calls.count.beta).toBe(1);
  });

  it('is a no-op for unknown ids and already-loaded ids', async () => {
    await metricsService.loadMetricConfigs(['gamma']);
    await metricsService.loadMetricConfigs(['gamma', 'unknown']);
    expect(mockQueries.__calls.count.gamma).toBe(1);
  });

  it('resolveTabMetrics merges cached config into layout-only entries', async () => {
    await metricsService.loadMetricConfigs(['alpha']);
    const resolved = metricsService.resolveTabMetrics([
      { id: 'alpha', gridRow: '1', gridColumn: '2', minHeight: 200 },
      { id: 'unloaded', gridRow: '2' }
    ]);
    expect(resolved[0]).toMatchObject({ name: 'Alpha', gridRow: '1', gridColumn: '2', minHeight: 200 });
    expect(resolved[1]).toEqual({ id: 'unloaded', gridRow: '2' });
  });
});
