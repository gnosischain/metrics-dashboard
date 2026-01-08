const metric = {
  id: 'api_execution_tokens_holders_total',
  name: 'Latest Token Holders',
  description: 'Per token',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: true,
  labelField: 'token',
  query: `SELECT token, value FROM dbt.api_execution_tokens_holders_latest_by_token`,
};
export default metric;

