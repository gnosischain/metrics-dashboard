const metric = {
  id: 'api_execution_cow_top_pairs_weekly',
  name: 'Top Pairs — Weekly Volume',
  description: 'Top 8 directional pairs + Other, weekly USD volume',
  metricDescription: 'Weekly USD trading volume for the top 8 directional token pairs (sold → bought) by lifetime volume on CoW Protocol. All other pairs are grouped as "Other". Pair direction matters — USDC.e → EURe and EURe → USDC.e are counted separately.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatCurrencyCompact',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  barWidth: 'auto',
  barMaxWidth: 36,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.9,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_cow_top_pairs_weekly`,
};
export default metric;
