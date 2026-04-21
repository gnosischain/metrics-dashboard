const metric = {
  id: 'api_execution_trades_stats_top_tokens_weekly',
  name: 'Top Tokens — Weekly Volume',
  description: 'Top 8 tokens + Other, weekly USD volume',
  metricDescription: 'Weekly USD trading volume for the top 8 tokens by lifetime volume (sold + bought side combined), with all other tokens rolled into "Other". Volume is always weekly regardless of the selected window; the window filters which weeks are shown.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatCurrencyCompact',
  showTotal: true,

  barWidth: 'auto',
  barMaxWidth: 36,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.9,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value_volume AS value FROM dbt.api_execution_trades_stats_top_tokens_weekly`,
};

export default metric;
