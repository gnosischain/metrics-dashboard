const metric = {
  id: 'api_execution_yields_lending_tvl_by_token_latest',
  name: 'Lending TVL by Token',
  description: 'Current distribution',
  metricDescription: 'Latest TVL distribution across Gnosis lending reserves (Aave V3 and SparkLend combined). Each slice shows the total USD value deposited by lenders for that token, aggregated across protocols.',
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value',
  enableFiltering: false,
  applySecondaryGlobalFilter: true,
  format: 'formatValue',
  donut: true,
  showLabels: true,
  sortByValue: 'desc',
  query: `SELECT token, protocol, value FROM dbt.api_execution_lending_tvl_by_token_latest`,
};

export default metric;
