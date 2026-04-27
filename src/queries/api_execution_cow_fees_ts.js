const metric = {
  id: 'api_execution_cow_fees_ts',
  name: 'Fees by Source',
  description: 'Daily CoW Protocol fees split by source',
  metricDescription: 'Daily CoW Protocol fees (USD) stacked by fee_source. Pre-2024 fees come from the on-chain feeAmount field on the Trade event ("onchain"); 2024+ fees come from the CoW API\'s surplus-based protocol fee model ("api"). Visualizes the protocol fee model transition.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatCurrencyCompact',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  smooth: true,
  symbolSize: 0,
  lineWidth: 1,
  areaOpacity: 0.75,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_cow_fees_ts`,
};
export default metric;
