const metric = {
  id: 'api_probelab_clients_country_daily',
  name: 'Country Distribution',
  description: 'Client per country',
  metricDescription: 'Daily client distribution by country, with client filter. Highlights geographic concentration and diversification trends.',
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
  seriesField: 'country', 
  labelField: 'client',

  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: true, 

  enableFiltering: true, 

  query: `SELECT * FROM dbt.api_probelab_clients_country_daily`,
};

export default metric;