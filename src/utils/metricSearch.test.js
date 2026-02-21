import { buildMetricSearchIndex, searchMetricIndex } from './metricSearch';

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
});
