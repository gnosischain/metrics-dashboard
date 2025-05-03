const metric = {
  id: 'historical_probelab_cl_client_distribution',
  name: 'Client Distribution',
  description: 'Daily consensus clients',
  format: 'formatNumber',
  labelField: 'client',
  valueField: 'value',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.probelab_peers_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;