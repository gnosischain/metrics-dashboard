const metric = {
  id: 'api_celo_gpay_total_volume',
  name: 'Payments Volume',
  description: 'All-time',
  metricDescription: `
  Cumulative card payment volume in USD since the Celo launch of Gnosis Pay 2.0 with MiniPay.

  Counts only wallet-to-merchant settlement transfers (card spend), in USDC and USDT (the two settlement tokens currently tracked).`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_celo_gpay_total_volume`,
};
export default metric;
