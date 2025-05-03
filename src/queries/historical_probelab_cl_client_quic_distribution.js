const metric = {
  id: 'historical_probelab_cl_client_quic_distribution',
  name: 'Clients QUIC Support',
  description: '7DMA distribution',
  format: 'formatNumber',
  chartType: 'stackedBar',
  labelField: 'client', 
  subLabelField: 'quic', 
  valueField: 'value',
  enableFiltering: true,
  query: `SELECT * FROM dbt.probelab_peers_clients_quic_daily ORDER BY date ASC, client ASC, quic ASC`,
};

export default metric;