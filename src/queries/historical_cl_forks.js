const metric = {
  id: 'historical_cl_forks',
  name: 'CL Forks Distribution',
  description: 'Distribution for forks across the network (Consensus Layer)',
  format: 'formatNumber',
  labelField: 'fork',
  valueField: 'cnt',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.p2p_peers_cl_fork_daily ORDER BY date ASC, fork ASC`,
};

export default metric;