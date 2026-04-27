const metric = {
  id: 'api_execution_cow_kpi_fees_7d',
  name: 'Fees',
  description: 'Last 7 days',
  metricDescription: 'Total CoW Protocol fees (USD) on Gnosis Chain in the last 7 complete days. Combines on-chain feeAmount (pre-2024) and CoW API surplus fees (2024+).',
  chartType: 'numberDisplay',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_cow_kpi_fees_7d`,
};
export default metric;
