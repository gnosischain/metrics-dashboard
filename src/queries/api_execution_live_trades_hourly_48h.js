const metric = {
  id: 'api_execution_live_trades_hourly_48h',
  name: 'DEX Volume — Last 48h',
  description: 'Hourly USD volume, stacked by protocol',
  metricDescription: 'Hourly USD volume across Uniswap V3, Swapr V3, Balancer V2 and Balancer V3 over the last 48 hours of cached data. Volume is summed per swap, so multi-hop trades contribute to every protocol they touch — this reflects protocol activity rather than net trade notionals.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumberWithUSD',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  barWidth: 'auto',
  barMaxWidth: 40,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.85,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_live_trades_hourly_48h`,
};

export default metric;
