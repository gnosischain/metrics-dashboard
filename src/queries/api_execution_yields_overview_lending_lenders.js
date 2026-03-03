const metric = {
  id: 'api_execution_yields_overview_lending_lenders',
  name: 'Total Lenders',
  description: 'All-time on Aave V3',
  metricDescription: 'Cumulative unique wallets that have supplied at least one asset on Aave V3. Change compares new lenders in last 7D vs prior 7D.',
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
