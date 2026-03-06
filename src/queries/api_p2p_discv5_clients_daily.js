const metric = {
  id: 'api_p2p_discv5_clients_daily',
  name: 'DiscV5 Peer Distribution',
  description: 'Distribution of peers dialable in DiscV5 protocol',
  metricDescription: `
  Daily distribution of DiscV5 peers, stacked by category.

  Use the metric filter to switch between:

  - __Clients:__ consensus-layer client implementation
  - __Platform:__ operating system
  - __Provider:__ hosting provider or ISP
  - __Country:__ geographic location via IP geolocation

  Each peer is counted once per day (latest crawl observation). Toggle between count and share views.`,
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

  query: `SELECT * FROM dbt.api_p2p_discv5_clients_daily`,
};

export default metric;