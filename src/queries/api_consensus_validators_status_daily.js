const metric = {
  id: 'api_consensus_validators_status_daily',
  name: 'Status of Validators',
  description: 'Daily Number of Validators for different statuses',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  defaultZoom: {
    start: 80, 
    end: 100   
  },
  
  barOpacity: 0.8, 
  
  // Field mappings for the bar chart
  xField: 'date',
  yField: 'cnt',
  seriesField: 'status', 
  
  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: false, 
  
  query: `SELECT * FROM dbt.api_consensus_validators_status_daily`,
};

export default metric;