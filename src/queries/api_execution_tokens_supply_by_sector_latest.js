const metric = {
  id: 'api_execution_tokens_supply_by_sector_latest',
  name: 'Supply by Sector',
  description: 'Token supply distribution by sector (USD value)',
  chartType: 'pie',
  enableFiltering: true,
  labelField: 'token_class',
  nameField: 'label',
  valueField: 'value_usd',
  format: 'formatCurrency',
  useAbbreviatedLabels: true,
  query: `SELECT token_class, label, value_usd, percentage FROM dbt.api_execution_tokens_supply_by_sector_latest`,
};

export default metric;
