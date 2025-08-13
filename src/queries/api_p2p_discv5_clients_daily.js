const metric = {
  id: 'api_p2p_discv5_clients_daily',
  name: 'EL Client Distribution',
  description: 'Distribution of block production per client',
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
    start: 70, 
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