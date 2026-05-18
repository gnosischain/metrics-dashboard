const metric = {
  id: 'api_execution_cow_kpi_fees_7d',
  name: 'Fees',
  description: 'Last 7 days',
  metricDescription: 'Total CoW Protocol fees (USD) collected on Gnosis Chain in the last 7 complete days. Reflects the surplus-based fee model introduced in Sep 2024. Pre-Sep 2024 on-chain feeAmount values are excluded — they represented signed-maximum under CoW v1\'s fee-subsidy model, not actual protocol revenue.',
  chartType: 'numberDisplay',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_cow_kpi_fees_7d`,
};
export default metric;
