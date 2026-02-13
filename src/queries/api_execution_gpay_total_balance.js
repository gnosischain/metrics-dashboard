const metric = {
  id: 'api_execution_gpay_total_balance',
  name: 'Total Balance',
  description: 'Latest wallet balance',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_total_balance`,
};
export default metric;
