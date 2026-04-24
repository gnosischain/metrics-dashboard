const metric = {
  id: 'api_execution_cow_batch_metrics_ts',
  name: 'CoW Ratio',
  description: 'Share of batches with pure peer-to-peer matching',
  metricDescription: 'Percentage of settlement batches that were pure Coincidence of Wants — meaning multiple trades were matched directly against each other with zero AMM interactions in the batch. Higher values indicate more efficient peer-to-peer matching by solvers.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatPercentage',

  smooth: true,
  symbolSize: 0,
  lineWidth: 2,

  xField: 'date',
  yField: 'value',

  query: `SELECT date, value FROM dbt.api_execution_cow_batch_metrics_ts`,
};
export default metric;
