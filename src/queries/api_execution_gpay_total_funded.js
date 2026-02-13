const metric = {
  id: 'api_execution_gpay_total_funded',
  name: 'Funded Wallets',
  description: 'All-time',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_total_funded`,
};
export default metric;
