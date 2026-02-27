const metric = {
  id: 'api_p2p_discv4_clients_daily',
  name: 'DiscV4 Peer Distribution',
  description: 'Distribution of peers dialable in DiscV4 protocol',
  metricDescription: 'Daily distribution of DiscV4 peers by client implementation. Metric filter lets you switch between count and share views.',
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