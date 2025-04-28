const metric = {
  id: 'historical_probelab_cl_client_distribution',
  name: 'Probelab: CL Client Distribution',
  description: 'Distribution of consensus client',
  format: 'formatNumber',
  labelField: 'client',
  valueField: 'value',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.probelab_peers_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;