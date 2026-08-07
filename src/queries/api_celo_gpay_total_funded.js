const metric = {
  id: 'api_celo_gpay_total_funded',
  name: 'Funded Cards',
  description: 'All-time',
  metricDescription: `
  Total Gnosis Pay card Safes on Celo that have ever __received__ money (any
  inbound Top-up / Reversal / Cashback).

  Distinct from Activated Cards, which counts first spend. A card can be funded
  without activating. Not comparable to the Gnosis Chain "Funded" tile, which is
  still payment-derived.
  `,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_celo_gpay_total_funded`,
};
export default metric;
