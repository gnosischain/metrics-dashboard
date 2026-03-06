const metric = {
  id: 'api_probelab_clients_cloud_daily',
  name: 'Cloud Distribution',
  description: 'Clients per cloud provider',
  metricDescription: `
  Daily peer distribution by hosting provider from ProbeLab crawls.

  Providers are classified as cloud (AWS, Hetzner, OVH, etc.) or __Home/Office__ (residential ISPs). High concentration on a single provider is a centralization risk. Use the client filter to see provider preferences by implementation.`,
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
  seriesField: 'cloud', 
  labelField: 'client',

  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: true, 

  enableFiltering: true, 
  query: `SELECT * FROM dbt.api_probelab_clients_cloud_daily`,
};

export default metric;