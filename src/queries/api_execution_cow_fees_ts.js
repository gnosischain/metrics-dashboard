const metric = {
  id: 'api_execution_cow_fees_ts',
  name: 'Protocol Fees',
  description: 'Daily CoW Protocol revenue (surplus-based fees)',
  metricDescription: 'Daily CoW Protocol revenue on Gnosis Chain — surplus-based fees collected since Sep 2024. Pre-Sep 2024 is excluded: under CoW v1\'s fee-subsidy model, the on-chain feeAmount field represented the user\'s signed-maximum, not actual protocol revenue. The DAO reimbursed solvers for gas + a small protocol margin off-chain via CIP-12 / solver rewards, so on-chain feeAmount values do not reflect what CoW actually kept as revenue.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatCurrencyCompact',

  smooth: true,
  symbolSize: 0,
  lineWidth: 2,
  areaOpacity: 0.6,

  xField: 'date',
  yField: 'value',

  query: `SELECT date, value FROM dbt.api_execution_cow_fees_ts`,
};
export default metric;
