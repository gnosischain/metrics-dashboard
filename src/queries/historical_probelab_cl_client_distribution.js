const metric = {
  id: 'historical_probelab_cl_client_distribution',
  name: 'Client Distribution',
  description: 'Daily consensus clients',
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
  seriesField: 'client',

  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: true, 

  enableFiltering: true, 


  query: `SELECT * FROM dbt.probelab_peers_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;