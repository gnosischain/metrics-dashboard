const metric = {
  id: 'api_execution_yields_lending_lenders_count_7d',
  name: 'Aave V3 Lenders Count',
  description: 'Unique lenders (last 7 days)',
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
