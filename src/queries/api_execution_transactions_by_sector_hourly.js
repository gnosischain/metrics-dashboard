const metric = {
  id: 'api_execution_transactions_by_sector_hourly',
  name: 'Transactions per Sector',
  description: 'Hourly number Transactions per Sector, Last 2 days',
  metricDescription: 'Hourly transaction counts by sector for the recent 48-hour window. Captures near-real-time sector demand changes.',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  showTotal: true, 
  
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