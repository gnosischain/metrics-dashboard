const metric = {
  id: 'api_execution_stablecoins_supply_distribution_latest',
  name: 'Stablecoin Supply Distribution',
  description: 'Current share of each stablecoin',
  format: 'formatNumber',
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value',
  query: `SELECT * FROM dbt.api_execution_stablecoins_supply_distribution_latest`,
};

export default metric;

