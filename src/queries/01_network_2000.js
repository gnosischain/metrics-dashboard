/**
 * Client Distribution Metric Definition
 */
const metric = {
  id: '01_network_2000',
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

export default metric;