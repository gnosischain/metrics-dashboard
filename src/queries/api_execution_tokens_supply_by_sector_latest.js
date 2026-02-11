const metric = {
  id: 'api_execution_tokens_supply_by_sector_latest',
  name: 'Supply by Sector',
  description: 'Token supply distribution by sector in USD',
  chartType: 'pie',
  enableFiltering: true,
  labelField: 'token_class',
  nameField: 'label',
  valueField: 'value_usd',
  format: 'formatCurrency',
  useAbbreviatedLabels: true,
  pieLabelValue: false,
  query: `SELECT token_class, label, value_usd, percentage FROM dbt.api_execution_tokens_supply_by_sector_latest`,
};

export default metric;
