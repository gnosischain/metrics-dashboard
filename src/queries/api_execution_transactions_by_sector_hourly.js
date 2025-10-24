const metric = {
  id: 'api_execution_transactions_by_sector_hourly',
  name: 'Transactions per Sector',
  description: 'Hourly number Transactions per Sector, last 2 days',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  showTotal: true, 
  
  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],

  symbolSize: 2,
  lineWidth: 2,
  barOpacity: 0.8,  
  
  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT * FROM dbt.api_execution_transactions_by_sector_hourly`,
};

export default metric;