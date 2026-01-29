const metric = {
  id: 'api_execution_yields_overview_lending_lenders',
  name: 'Total Lenders',
  description: 'All-time unique suppliers on Aave V3',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: '7D vs prior 7D'
  },
  query: `SELECT value, change_pct FROM dbt.api_execution_yields_overview_lending_lenders`,
};

export default metric;
