const metric = {
  id: 'historical_probelab_cl_client_cloud_distribution',
  name: 'Cloud Distribution',
  description: 'Clients per cloud provider',
  format: 'formatNumber',
  chartType: 'stackedBar',
  labelField: 'client', // Primary label (filter dropdown)
  subLabelField: 'cloud', // Secondary label (becomes chart series)
  valueField: 'value', // Value field
  enableFiltering: true, // Enable the filter dropdown
  query: `SELECT * FROM dbt.probelab_peers_clients_cloud_daily ORDER BY date ASC, client ASC, cloud ASC`,
};

export default metric;