const metric = {
  id: 'api_esg_info_category_daily',
  name: 'Daily Estimations by Node Category',
  description: 'Emissions, Energy Consumption, Nodes',
  metricDescription: 'Daily emissions and energy estimates by node-category segment. Category filter shows which node groups drive footprint changes.',
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
  labelField: 'category',
  
  
  showTotal: true, 

  enableFiltering: true, 

  query: `SELECT * FROM dbt.api_esg_info_category_daily`,
};

export default metric;