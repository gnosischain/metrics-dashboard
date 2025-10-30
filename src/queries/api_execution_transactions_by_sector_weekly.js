const metric = {
  id: 'api_execution_transactions_by_sector_weekly',
  name: 'Transactions by Sector',
  description: 'Weekly transactions per sector',
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
  tooltipOrder: 'valueDesc',
  query: `SELECT * FROM dbt.api_execution_transactions_by_sector_weekly`,
};
export default metric;