const metric = {
  id: 'api_execution_gnosis_app_kpi_marketplace_payers_7d',
  name: 'Marketplace Payers',
  description: 'Last 7 days',
  metricDescription: `Distinct buyers on the Gnosis App marketplace in the last 7 full days (today excluded). Counts unique \`payer\` addresses on \`PaymentReceived\` events for curated offers where the payer is a **Gnosis App user** and the transaction was relayed by an active Cometh ERC-4337 bundler; offers on the exclusion seed (\`gnosis_app_marketplace_offers_excluded\`) are removed. A distinct-address count, so an address buying several times counts once.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_marketplace_payers_7d`,
};
export default metric;
