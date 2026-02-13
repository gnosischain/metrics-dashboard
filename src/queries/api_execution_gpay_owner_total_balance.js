const metric = {
  id: 'api_execution_gpay_owner_total_balance',
  name: 'Owner Total Balance',
  description: 'Latest owner balance',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_owner_total_balance`,
};
export default metric;
