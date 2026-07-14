const metric = {
  id: 'api_celo_gpay_total_funded',
  name: 'Funded Cards',
  description: 'All-time',
  metricDescription: `
  Total Gnosis Pay card Safes that have made at least one card payment on Celo.

  A card is counted as __funded__ from the date of its first payment.`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_celo_gpay_total_funded`,
};
export default metric;
