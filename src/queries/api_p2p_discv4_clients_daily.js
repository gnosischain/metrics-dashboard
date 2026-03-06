const metric = {
  id: 'api_p2p_discv4_clients_daily',
  name: 'DiscV4 Peer Distribution',
  description: 'Distribution of peers dialable in DiscV4 protocol',
  metricDescription: `
  Last day distribution of DiscV4 peers, stacked by category.

  Use the metric filter to switch between:

  - __Clients:__ execution-layer client implementation
  - __Platform:__ operating system
  - __Provider:__ hosting provider or ISP
  - __Country:__ geographic location via IP geolocation
  `,
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
    // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],

  symbolSize: 2,
  lineWidth: 2,
  barOpacity: 0.8,  


  defaultZoom: {
    start: 0, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'value',
  seriesField: 'label', 
  labelField: 'metric',
  
  showTotal: true, 

  enableFiltering: true, 

  query: `SELECT * FROM dbt.api_p2p_discv4_clients_daily`,
};

export default metric;