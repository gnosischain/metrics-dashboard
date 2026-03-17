const metric = {
  id: 'api_execution_yields_overview_lending_lenders',
  name: 'Active Lenders',
  description: 'Current on Aave V3',
  metricDescription: 'Unique wallets currently holding a positive supply balance on Aave V3. Change compares active lender count vs 7 days ago.',
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
