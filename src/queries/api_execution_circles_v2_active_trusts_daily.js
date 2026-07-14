const metric = {
  id: 'api_execution_circles_v2_active_trusts_daily',
  name: 'Active Trusts',
  description: 'Cumulative active trust relationships',
  metricDescription: `Daily running total of **active trust edges** in the Circles v2 trust graph — directed \`truster\` -> \`trustee\` relationships that have been set and not yet expired or revoked. Each day's value is the cumulative sum of edges created minus edges revoked/expired through that date; mutual trust counts as two edges. Daily grain; the current (incomplete) day is excluded.`,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `SELECT date, active_trusts AS value FROM dbt.api_execution_circles_v2_active_trusts_daily`,
};

export default metric;
