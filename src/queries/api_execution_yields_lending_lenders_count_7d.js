const metric = {
  id: 'api_execution_yields_lending_lenders_count_7d',
  name: 'Lenders',
  description: 'Last 7 days',
  metricDescription: 'Unique wallets that supplied at least one asset on Aave V3 in the last 7 days. Change compares to the prior 7-day window.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: true,
  labelField: 'token',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs prior 7 days'
  },
  query: `SELECT * FROM dbt.api_execution_yields_lending_lenders_count_7d`,
};

export default metric;
