const metric = {
  id: 'api_execution_yields_user_kpi_active_lending_positions',
  name: 'Lending Positions',
  description: 'Active reserves',
  metricDescription: 'Number of Aave V3 reserves where the selected wallet currently has a positive supply balance.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, active_lending_positions AS value
    FROM dbt.api_execution_yields_user_kpis
  `,
};

export default metric;
