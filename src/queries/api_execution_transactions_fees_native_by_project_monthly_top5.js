const metric = {
  id: 'api_execution_transactions_fees_native_by_project_monthly_top5',
  name: 'Top-5 Projects by Fees',
  description: 'Monthly fees per project in xDAI',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: false,
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
  yAxis: {
    name: 'xDAI',
    nameLocation: 'middle',
    nameRotate: 90,
    nameGap: 60,                 
    nameTextStyle: { fontWeight: 500 }
  },
  grid: {
    left: 70                     
  },
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_by_project_monthly_top5`,
};
export default metric;