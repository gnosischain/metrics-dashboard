const metric = {
  id: 'api_execution_circles_v2_token_count_daily',
  name: 'Distinct CRC Tokens',
  description: 'Daily count of distinct CRC tokens with non-zero supply',
  metricDescription: 'Daily count of distinct Circles v2 CRC tokens that have non-zero supply.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `SELECT date, token_count AS value FROM dbt.api_execution_circles_v2_total_supply_daily`,
};

export default metric;
