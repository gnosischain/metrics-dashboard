/**
 * Client Distribution Metric Definition
 */
const metric = {
  id: '01_network_2100',
  name: 'CL Forks Distribution',
  description: 'Distribution for forks across the network (Consensus Layer)',
  format: 'formatNumber',
  labelField: 'fork',
  valueField: 'cnt',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.p2p_peers_cl_fork_daily ORDER BY date ASC, fork ASC`,
};

export default metric;