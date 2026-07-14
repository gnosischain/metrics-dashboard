const metric = {
  id: 'api_execution_yields_overview_lending_lenders',
  name: 'Active Lenders',
  description: 'Current',
  metricDescription: 'Unique wallets currently holding a supply balance worth more than $0.01 (sub-cent dust excluded) across Gnosis lending markets (Aave V3 and SparkLend). Counted once across protocols. Change compares active lender count vs 7 days ago.',
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
