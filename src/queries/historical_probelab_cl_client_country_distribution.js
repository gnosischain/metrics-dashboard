const metric = {
  id: 'historical_probelab_cl_client_country_distribution',
  name: 'Country Distribution',
  description: 'Client per country',
  format: 'formatNumber',
  chartType: 'stackedBar',
  labelField: 'client', 
  subLabelField: 'country', 
  valueField: 'value',
  enableFiltering: true,
  query: `SELECT * FROM dbt.probelab_peers_clients_country_daily ORDER BY date ASC, client ASC, country ASC`,
};

export default metric;