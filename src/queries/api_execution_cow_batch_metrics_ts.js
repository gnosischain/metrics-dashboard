const metric = {
  id: 'api_execution_cow_batch_metrics_ts',
  name: 'Avg Trades per Batch',
  description: 'Average trades settled per settlement batch',
  metricDescription: 'Daily average number of trades settled per CoW Protocol batch auction. Values above 1.0 indicate days where the solver matched multiple orders in a single settlement (CoW matching). On Gnosis Chain this peaked at ~2.8 in mid-2021 and has trended toward ~1.02 today, reflecting that most batches now route through external DEX liquidity rather than internal order matching.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatDecimal',

  smooth: true,
  symbolSize: 0,
  lineWidth: 2,

  xField: 'date',
  yField: 'value',

  query: `SELECT date, value FROM dbt.api_execution_cow_batch_metrics_ts`,
};
export default metric;
