const metric = {
  id: 'api_execution_transactions_fees_native_by_sector_weekly',
  name: 'Fees by Sector',
  description: 'Weekly fees per sector in xDAI',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 90, 
    end: 100   
  },
  showTotal: true,
  format: 'formatNumber',
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
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_by_sector_weekly`,
};
export default metric;