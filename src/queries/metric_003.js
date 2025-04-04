/**
 * Client Distribution Metric Definition
 */
const metric_003 = {
  id: 'metric_003',
  name: 'CL Forks Distribution',
  description: 'Distribution for forks across the network (Consensus Layer)',
  format: 'formatNumber',
  labelField: 'fork',
  valueField: 'cnt',
  chartType: 'stackedBar',
  tab: '01 - Network',
  size: 'medium',
  query: `SELECT * FROM dbt.p2p_gnosis_peers_cl_fork_daily`
};

export default metric_003;