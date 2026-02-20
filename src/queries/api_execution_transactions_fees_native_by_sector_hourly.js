const metric = {
  id: 'api_execution_transactions_fees_native_by_sector_hourly',
  name: 'Fees by Sector',
  description: 'Hourly fees per sector in xDAI, Last 2 days',
  metricDescription: 'Hourly transaction fees in xDAI by sector for the recent 48-hour window. Good for spotting short-lived fee spikes.',
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
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_by_sector_hourly`,
};
export default metric;