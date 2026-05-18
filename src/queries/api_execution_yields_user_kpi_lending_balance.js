const metric = {
  id: 'api_execution_yields_user_kpi_lending_balance',
  name: 'Lending Balance',
  description: 'Current (USD)',
  metricDescription: 'Current total supply balance across all Gnosis lending markets (Aave V3 and SparkLend) for the selected wallet.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, total_lending_balance_usd AS value
    FROM dbt.api_execution_yields_user_kpis
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
