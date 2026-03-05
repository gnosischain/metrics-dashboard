const metric = {
  id: 'api_execution_yields_pools_tvl_by_pool_latest',
  name: 'TVL by Pool',
  description: 'TVL distribution across pools for selected token, in USD',
  metricDescription: 'Latest TVL distribution across pools for the selected token. Pie shares are within-token and indicate liquidity concentration.',
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
