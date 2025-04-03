/**
 * Client Distribution Metric Definition
 */
const metric_002 = {
  id: 'metric_002',
  name: 'Forks Distribution',
  description: 'Distribution for forks across the network',
  format: 'formatNumber',
  labelField: 'fork',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.p2p_gnosis_peers_fork_daily`
};

export default metric_002;