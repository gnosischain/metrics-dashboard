const metric = {
  id: 'api_execution_gpay_total_volume',
  name: 'Total Volume',
  description: 'All-time',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_total_volume`,
};
export default metric;
