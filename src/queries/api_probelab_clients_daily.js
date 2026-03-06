const metric = {
  id: 'api_probelab_clients_daily',
  name: 'Client Distribution',
  description: 'Daily consensus clients',
  metricDescription: `
  Daily distribution of consensus-layer clients observed by ProbeLab's Nebula crawler.

  Healthy networks target no single client exceeding 33% share to prevent correlated failures. Use this chart to monitor client diversity trends over time.`,
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
  seriesField: 'client',

  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: true, 

  enableFiltering: true, 


  query: `SELECT * FROM dbt.api_probelab_clients_daily`,
};

export default metric;