const metric = {
  id: 'api_probelab_clients_quic_daily',
  name: 'Clients QUIC Support',
  description: '7DMA distribution',
  metricDescription: '7-day average distribution of QUIC support by client, with client filter. Indicates transport-protocol adoption by implementation.',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  defaultZoom: {
    start: 0, 
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

  query: `SELECT * FROM dbt.api_probelab_clients_quic_daily`,
};

export default metric;