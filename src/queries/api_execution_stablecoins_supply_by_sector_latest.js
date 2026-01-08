const metric = {
  id: 'api_execution_stablecoins_supply_by_sector_latest',
  name: 'Stablecoin Holdings by Sector',
  description: 'Share of supply held by each sector',
  format: 'formatNumber',
  chartType: 'pie',
  nameField: 'label',
  valueField: 'value',
  query: `SELECT * FROM dbt.api_execution_stablecoins_supply_by_sector_latest`,
};

export default metric;

