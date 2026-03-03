const metric = {
  id: 'api_execution_yields_pools_tvl_latest',
  name: 'Total TVL',
  description: 'Across all pools',
  metricDescription: 'Total value locked across all tracked pools for the selected token. Change compares to 7 days ago.',
  format: 'formatValue',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: true,
  labelField: 'token',
  globalFilterField: 'token',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT token, value, change_pct FROM dbt.api_execution_yields_pools_tvl_latest`,
};

export default metric;
