const metric = {
  id: 'historical_probelab_cl_client_version_distribution',
  name: 'Probelab: CL Client Version Distribution',
  description: 'Distribution of consensus client per version',
  format: 'formatNumber',
  chartType: 'stackedBar',
  labelField: 'client', // Primary label (filter dropdown)
  subLabelField: 'version', // Secondary label (becomes chart series)
  valueField: 'value', // Value field
  enableFiltering: true, // Enable the filter dropdown
  query: `SELECT * FROM dbt.probelab_peers_clients_version_daily ORDER BY date ASC, client ASC, version ASC`,
};

export default metric;