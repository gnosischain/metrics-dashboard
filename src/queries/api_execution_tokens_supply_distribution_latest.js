const metric = {
  id: 'api_execution_tokens_supply_distribution_latest',
  name: 'Supply Distribution',
  description: 'Token supply distribution by token',
  chartType: 'pie',
  enableFiltering: true,
  labelField: 'token_class',
  nameField: 'token',
  valueField: 'value',
  useAbbreviatedLabels: true,
  query: `SELECT token_class, token, value, percentage FROM dbt.api_execution_tokens_supply_distribution_latest`,
};

export default metric;
