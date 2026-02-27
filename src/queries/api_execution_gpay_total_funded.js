const metric = {
  id: 'api_execution_gpay_total_funded',
  name: 'Funded Wallets',
  description: 'All-time',
  metricDescription: 'Total wallets that have made at least one Gnosis Pay card payment. A wallet is counted as "funded" from the date of its first payment.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_total_funded`,
};
export default metric;
