const metric = {
  id: 'api_execution_gpay_total_balance',
  name: 'Total Balance',
  description: 'EURe, GBPe, USDC.e',
  metricDescription: 'Combined USD value of all payment token balances (EURe, GBPe, USDC.e) across Gnosis Pay wallets. Excludes GNO.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_total_balance`,
};
export default metric;
