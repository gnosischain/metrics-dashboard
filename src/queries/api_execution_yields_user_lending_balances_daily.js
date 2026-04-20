const metric = {
  id: 'api_execution_yields_user_lending_balances_daily',
  name: 'Lending Balance',
  description: 'Daily supply balance by token',
  metricDescription: 'Daily supply balance history for the selected wallet across Gnosis lending markets (Aave V3 and SparkLend), stacked by token. Toggle between native token units and USD.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'balance_usd',
  seriesField: 'symbol',
  format: 'formatCurrency',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  enableZoom: false,
  enableFiltering: true,
  labelField: 'symbol',
  unitFields: {
    native: { field: 'balance', format: 'formatNumber' },
    usd: { field: 'balance_usd', format: 'formatCurrency' }
  },
  globalFilterField: 'wallet_address',
  query: `
    SELECT user_address AS wallet_address, date, symbol, balance, balance_usd
    FROM dbt.api_execution_yields_user_lending_balances_daily
  `,
};

export default metric;
