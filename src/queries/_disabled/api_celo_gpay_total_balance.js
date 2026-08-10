const metric = {
  id: 'api_celo_gpay_total_balance',
  name: 'Total Balance',
  description: 'Current',
  metricDescription: `
  Combined USD value of settlement-token balances (USDC, USDT) held across Gnosis Pay card Safes on Celo.

  Balances are derived from tracked on-chain transfers (net-flow method) and currently cover USDC and USDT only. Other tokens will be added as they are onboarded.`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_celo_gpay_total_balance`,
};
export default metric;
