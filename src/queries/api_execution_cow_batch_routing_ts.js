const metric = {
  id: 'api_execution_cow_batch_routing_ts',
  name: 'Batch Routing',
  description: 'Daily share of settlement batches by routing type',
  metricDescription: 'Daily percentage of CoW Protocol settlement batches by routing type. "Pure CoW" batches settle multiple user orders against each other with zero AMM interactions — true Coincidence of Wants. "Partial CoW" batches use both internal matching and external DEX liquidity. "Pure DEX" batches route all orders through AMMs with no internal matching. Pure CoW peaked at ~34% in Sep 2021 and has been near zero on Gnosis Chain since mid-2022, as order flow is not dense enough for reliable internal matching.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: false,
  stacked: true,
  format: 'formatPercentage',
  yAxis: { max: 100 },

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_cow_batch_routing_ts`,
};
export default metric;
