import { buildMetricSearchIndex, mergeRegistryMetadata, searchMetricIndex } from './metricSearch';

const DASHBOARDS_FIXTURE = [
  {
    id: 'network',
    name: 'Network',
    tabs: [
      {
        id: 'overview',
        name: 'Overview',
        metrics: [
          {
            id: 'api_p2p_topology_latest',
            name: 'P2P Geographic Network Topology',
            description: 'Geographic visualization of peer network connections'
          },
          {
            id: 'global_filter',
            name: 'Filter'
          },
          {
            id: 'api_p2p_topology_latest',
            name: 'P2P Geographic Network Topology'
          }
        ]
      }
    ]
  },
  {
    id: 'consensus',
    name: 'Consensus',
    tabs: [
      {
        id: 'validators',
        name: 'Validators',
        metrics: [
          {
            id: 'api_consensus_withdrawals_daily',
            name: 'Validator Withdrawals',
            description: 'Daily withdrawal volume'
          },
          {
            id: 'api_consensus_validators_daily',
            name: 'Active Validators',
            description: 'Daily active validator count'
          }
        ]
      }
    ]
  }
];

describe('metricSearch utilities', () => {
  it('builds index only from dashboard tabs and excludes non-navigable entries', () => {
    const index = buildMetricSearchIndex(DASHBOARDS_FIXTURE);

    expect(index.map(item => item.metricId)).toEqual([
      'api_p2p_topology_latest',
      'api_consensus_withdrawals_daily',
      'api_consensus_validators_daily'
    ]);

    expect(index.some(item => item.metricId === 'global_filter')).toBe(false);
    expect(index.some(item => item.metricId === 'orphan_metric_only_in_queries')).toBe(false);
  });

  it('prioritizes metric name exact/prefix matches over weaker contextual matches', () => {
    const index = buildMetricSearchIndex(DASHBOARDS_FIXTURE);
    const results = searchMetricIndex(index, 'network topology');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].metricId).toBe('api_p2p_topology_latest');
  });

  it('supports typo-near matching with light fuzzy scoring', () => {
    const index = buildMetricSearchIndex(DASHBOARDS_FIXTURE);
    const results = searchMetricIndex(index, 'withdrawl');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].metricId).toBe('api_consensus_withdrawals_daily');
  });

  it('supports limit option and stable deterministic ordering', () => {
    const index = buildMetricSearchIndex(DASHBOARDS_FIXTURE);
    const results = searchMetricIndex(index, 'validator', { limit: 1 });

    expect(results).toHaveLength(1);
    expect(results[0].metricId).toBe('api_consensus_validators_daily');
  });

  describe('mergeRegistryMetadata', () => {
    const REGISTRY = {
      api_esg_carbon_emissions_daily: {
        name: 'Network CO2 Emissions',
        description: 'Daily kgCO2 emissions from the network'
      },
      api_loaded_metric: {
        name: 'Stale Registry Name',
        description: 'Stale registry description'
      }
    };

    it('backfills registry metadata for layout-only entries', () => {
      const merged = mergeRegistryMetadata(
        [{ id: 'api_esg_carbon_emissions_daily', gridRow: '1', gridColumn: '1 / span 6' }],
        REGISTRY
      );

      expect(merged[0].name).toBe('Network CO2 Emissions');
      expect(merged[0].description).toBe('Daily kgCO2 emissions from the network');
      expect(merged[0].gridRow).toBe('1');
    });

    it('never overrides fields from an already-loaded config', () => {
      const merged = mergeRegistryMetadata(
        [{ id: 'api_loaded_metric', name: 'Loaded Name', description: 'Loaded description' }],
        REGISTRY
      );

      expect(merged[0].name).toBe('Loaded Name');
      expect(merged[0].description).toBe('Loaded description');
    });

    it('passes entries through when registry is missing or has no entry', () => {
      const metrics = [{ id: 'api_unknown_metric', gridRow: '2' }];

      expect(mergeRegistryMetadata(metrics, null)).toBe(metrics);
      expect(mergeRegistryMetadata(metrics, REGISTRY)[0]).toEqual(metrics[0]);
    });

    it('makes unloaded metrics searchable by display name via the index', () => {
      const dashboards = [{
        id: 'esg',
        name: 'ESG',
        tabs: [{
          id: 'emissions',
          name: 'Emissions',
          metrics: mergeRegistryMetadata(
            [{ id: 'api_esg_carbon_emissions_daily', gridRow: '1' }],
            REGISTRY
          )
        }]
      }];

      const results = searchMetricIndex(buildMetricSearchIndex(dashboards), 'co2 emissions');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].metricId).toBe('api_esg_carbon_emissions_daily');
      expect(results[0].metricName).toBe('Network CO2 Emissions');
    });
  });
});
