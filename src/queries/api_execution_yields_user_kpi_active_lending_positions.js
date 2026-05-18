const metric = {
  id: 'api_execution_yields_user_kpi_active_lending_positions',
  name: 'Lending Positions',
  description: 'Active reserves',
  metricDescription: 'Number of (protocol, reserve) combinations where the selected wallet currently has a positive supply balance across Gnosis lending markets (Aave V3 and SparkLend). A wallet supplying the same asset on both protocols counts as two positions.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, active_lending_positions AS value
    FROM dbt.api_execution_yields_user_kpis
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
