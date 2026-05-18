const metric = {
  id: 'api_execution_circles_v2_active_trusts_daily',
  name: 'Active Trusts',
  description: 'Cumulative active trust relationships',
  metricDescription: 'Daily cumulative count of active Circles v2 trust relationships across the network.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `SELECT date, active_trusts AS value FROM dbt.api_execution_circles_v2_active_trusts_daily`,
};

export default metric;
