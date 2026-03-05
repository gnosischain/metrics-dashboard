const metric = {
  id: 'api_execution_tokens_supply_distribution_latest',
  name: 'Supply Distribution',
  description: 'Token supply distribution by token in USD',
  metricDescription: 'Latest token supply distribution in USD for the selected token class. Pie shares are computed within class totals.',
  chartType: 'pie',
  enableFiltering: true,
  labelField: 'token_class',
  nameField: 'token',
  valueField: 'value_usd',
  format: 'formatCurrency',
  useAbbreviatedLabels: true,
  pieLabelValue: false,
  query: `SELECT token_class, token, value_usd, percentage FROM dbt.api_execution_tokens_supply_distribution_latest`,
};

export default metric;
