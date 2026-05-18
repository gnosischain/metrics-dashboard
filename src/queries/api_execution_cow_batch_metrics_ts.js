const metric = {
  id: 'api_execution_cow_batch_metrics_ts',
  name: 'Batch Composition',
  description: 'Share of batches by matching type',
  metricDescription: 'Daily share of CoW Protocol settlement batches by routing type. "Pure CoW" = multiple trades matched directly with zero AMM interactions. "Partial CoW" = multi-trade batch where some peer matching happened (num_trades > num_interactions). "Pure DEX" = single-trade batches and multi-trade batches fully routed through AMMs. Pure CoW peaked at ~34% in Oct 2021 and is near zero on Gnosis Chain since 2022.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatPercentage',

  smooth: true,
  symbolSize: 0,
  lineWidth: 2,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_cow_batch_metrics_ts`,
};
export default metric;
