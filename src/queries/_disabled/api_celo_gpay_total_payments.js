const metric = {
  id: 'api_celo_gpay_total_payments',
  name: 'Payments',
  description: 'All-time',
  metricDescription: `
  Cumulative card payment count since the Celo launch of Gnosis Pay 2.0 with MiniPay.

  Counts only wallet-to-merchant settlement transfers (card spend), in USDC and USDT.`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_celo_gpay_total_payments`,
};
export default metric;
