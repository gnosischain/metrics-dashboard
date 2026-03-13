const metric = {
  id: 'api_execution_yields_lending_tvl_by_token_latest',
  name: 'Lending TVL by Token',
  description: 'Current distribution',
  metricDescription: 'Latest TVL distribution across Aave V3 lending reserves on Gnosis Chain. Each slice shows the total USD value deposited by lenders for that token.',
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value',
  enableFiltering: false,
  format: 'formatValue',
  donut: true,
  showLabels: true,
  sortByValue: 'desc',
  query: `SELECT token, value FROM dbt.api_execution_yields_lending_tvl_by_token_latest`,
};

export default metric;
