const metric = {
  id: 'api_celo_gpay_total_activated',
  name: 'Activated Cards',
  description: 'All-time',
  metricDescription: `
  Total Gnosis Pay card Safes on Celo that have ever __spent__ — i.e. settled at
  least one Payment to a settlement contract.

  Strictly less than or equal to Funded Cards. A card can be funded without ever
  activating. Celo-only: Gnosis Chain does not yet expose this split (its "funded"
  tile is still payment-derived).
  `,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_celo_gpay_total_activated`,
};
export default metric;
