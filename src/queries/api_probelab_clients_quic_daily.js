const metric = {
  id: 'api_probelab_clients_quic_daily',
  name: 'Clients QUIC Support',
  description: '7DMA distribution',
  metricDescription: `
  7-day moving average of QUIC transport protocol support across consensus clients, sourced from ProbeLab crawls.

  QUIC offers lower-latency peer connections compared to TCP. Use the client filter to compare adoption rates by implementation.`,
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