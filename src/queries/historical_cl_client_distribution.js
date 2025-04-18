const metric = {
  id: 'historical_cl_client_distribution',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  format: 'formatNumber',
  labelField: 'client',
  valueField: 'value',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.p2p_peers_clients_daily ORDER BY date ASC, client ASC`
};

export default metric;