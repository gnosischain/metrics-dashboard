const metric = {
  id: 'historical_probelab_cl_client_quic_distribution',
  name: 'Clients QUIC Support',
  description: '7DMA distribution',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  defaultZoom: {
    start: 70, 
    end: 100   
  },
  
  barOpacity: 0.8, 
  
  // Field mappings for the bar chart
  xField: 'date',
  yField: 'value',
  seriesField: 'quic', 
  labelField: 'client',

  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: true, 

  enableFiltering: true, 

  query: `SELECT * FROM dbt.probelab_peers_clients_quic_daily ORDER BY date ASC, client ASC, quic ASC`,
};

export default metric;