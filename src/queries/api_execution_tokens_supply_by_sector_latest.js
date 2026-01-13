const metric = {
  id: 'api_execution_tokens_supply_by_sector_latest',
  name: 'Supply by Sector',
  description: 'Token supply distribution by sector',
  chartType: 'pie',
  enableFiltering: true,
  labelField: 'token_class',
  nameField: 'label',
  valueField: 'value',
  useAbbreviatedLabels: true,
  query: `SELECT token_class, label, value, value_usd, percentage FROM dbt.api_execution_tokens_supply_by_sector_latest`,
};

export default metric;
