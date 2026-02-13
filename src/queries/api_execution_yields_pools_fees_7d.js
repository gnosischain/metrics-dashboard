const metric = {
  id: 'api_execution_yields_pools_fees_7d',
  name: 'Fees (7D)',
  description: 'Total fees accrued over the last 7 days, in USD',
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
  query: `SELECT token, value, change_pct FROM dbt.api_execution_yields_pools_fees_7d`,
};

export default metric;
