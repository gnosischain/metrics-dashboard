const metric = {
  id: 'api_execution_trades_stats_net_flow',
  name: 'Net Token Flow',
  description: 'Top 10 tokens by |net USD flow|',
  metricDescription: 'Top 10 tokens by absolute net USD flow. Positive = net accumulation (more USD bought into the token than sold), negative = net distribution. Window matches the Stats tab time selector.',
  chartType: 'bar',
  isTimeSeries: false,
  format: 'formatCurrencyCompact',

  barWidth: 'auto',
  barMaxWidth: 44,
  borderRadius: [2, 2, 2, 2],
  barOpacity: 0.9,

  xField: 'label',
  yField: 'value',

  timeWindowField: 'time_window',

  query: `SELECT label, value, bought_usd, sold_usd, time_window FROM dbt.api_execution_trades_stats_net_flow ORDER BY abs(value) DESC`,
};

export default metric;
