const metric = {
  id: 'api_execution_trades_stats_traders_weekly',
  name: 'Weekly Unique Traders',
  description: 'Unique trader addresses per week',
  metricDescription: 'Number of distinct wallet addresses that executed at least one DEX trade on Gnosis Chain in a given week (Monday–Sunday). Uses the transaction sender (tx.from) as the trader identity. Weekly grain avoids double-counting users who trade multiple times in a day.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',

  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.6,

  defaultZoom: { start: 0, end: 100 },

  xField: 'date',
  yField: 'value',

  query: `SELECT date, value FROM dbt.api_execution_trades_stats_traders_weekly`,
};

export default metric;
