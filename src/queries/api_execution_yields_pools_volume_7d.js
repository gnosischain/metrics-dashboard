const metric = {
  id: 'api_execution_yields_pools_volume_7d',
  name: 'Trading Volume',
  description: 'Last 7 days',
  metricDescription: 'Total gross trading volume across all tracked pools for the selected token. Change compares to the prior 7-day window.',
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
    period: 'vs prior 7 days'
  },
  query: `SELECT token, value, change_pct FROM dbt.api_execution_yields_pools_volume_7d`,
};

export default metric;
