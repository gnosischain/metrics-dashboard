const metric = {
  id: 'api_execution_tokens_count_total',
  name: 'Number of Tokens',
  description: 'Total tracked tokens',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT COUNT(*) as value FROM dbt.api_execution_tokens_holders_latest_by_token`,
};
export default metric; 