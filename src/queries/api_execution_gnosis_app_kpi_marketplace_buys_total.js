const metric = {
  id: 'api_execution_gnosis_app_kpi_marketplace_buys_total',
  name: 'Total Marketplace Buys',
  description: 'All time',
  metricDescription: `Lifetime number of Gnosis App marketplace purchases across every curated offer, from launch on 2025-11-12 onward. Sums \`total_buys\` (\`PaymentReceived\` events) over all offers, applying the same filters as the 7-day metric: the payer is a **Gnosis App user**, the transaction was relayed by an active Cometh ERC-4337 bundler, and offers on the exclusion seed (\`gnosis_app_marketplace_offers_excluded\`) are removed. An all-time count, not USD.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_marketplace_buys_total`,
};
export default metric;
