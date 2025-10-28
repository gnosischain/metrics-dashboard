const metric = {
  id: 'api_execution_transactions_fees_native_by_sector_daily',
  name: 'Fees by Sector (Daily)',
  description: 'Daily fees per sector (native)',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 90, 
    end: 100   
  },
  format: 'formatNumber',
  showTotal: true,
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.8,
  symbolSize: 2,
  lineWidth: 2,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `SELECT date, value, sector AS label FROM dbt.api_execution_transactions_fees_native_by_sector_daily`,
};
export default metric;