const metric = {
  id: 'api_execution_yields_pools_tvl_by_pool_latest',
  name: 'TVL by Pool',
  description: 'Current distribution',
  metricDescription: 'Latest TVL distribution across pools for the selected token. Pie shares show within-token liquidity concentration.',
  chartType: 'pie',
  nameField: 'label',
  valueField: 'value',
  enableFiltering: true,
  labelField: 'token',
  globalFilterField: 'token',
  format: 'formatValue',
  donut: true,
  showLabels: true,
  sortByValue: 'desc',
  query: `SELECT token, label, value FROM dbt.api_execution_yields_pools_tvl_by_pool_latest`,
};

export default metric;
