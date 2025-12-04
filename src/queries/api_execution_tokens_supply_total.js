const metric = {
  id: 'api_execution_tokens_supply_total',
  name: 'Latest Token Supply',
  description: 'Per token',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: true,
  labelField: 'token',
  query: `SELECT token, value FROM playground_max.api_execution_tokens_supply_latest_by_token`,
};
export default metric;

