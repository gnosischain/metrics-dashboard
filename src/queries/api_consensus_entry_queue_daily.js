const metric = {
  id: 'api_consensus_entry_queue_daily',
  name: 'Validators Entry Queue',
  description: 'Daily average in days',
  chartType: 'line', 
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
    start: 80, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'mean',

  // Example query that returns quantile data
  query: `SELECT * FROM dbt.api_consensus_entry_queue_daily`
};

export default metric;