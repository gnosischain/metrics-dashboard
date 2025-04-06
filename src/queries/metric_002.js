/**
 * Client Distribution Metric Definition
 */
const metric_002 = {
  id: 'metric_002',
  name: 'EL Forks Distribution',
  description: 'Distribution for forks across the network (Execution Layer)',
  format: 'formatNumber',
  labelField: 'fork',
  valueField: 'cnt',
  chartType: 'stackedBar',
  tab: '01 - Network',
  size: 'medium',
  query: `SELECT * FROM dbt.p2p_gnosis_peers_el_fork_daily ORDER BY date ASC, fork ASC`,
};

export default metric_002;