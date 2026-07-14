const metric = {
  id: 'api_execution_gnosis_app_kpi_marketplace_buys_7d',
  name: 'Marketplace Buys',
  description: 'Last 7 days',
  metricDescription: `Number of Gnosis App marketplace purchases in the last 7 full days (today, the incomplete day, excluded). Counts \`PaymentReceived\` events on curated marketplace offers where the **payer is a Gnosis App user** and the transaction was relayed by an active Cometh ERC-4337 bundler (via the \`0x…71727de…\` EntryPoint). Offers on the exclusion seed (\`gnosis_app_marketplace_offers_excluded\`) are not counted. The change figure compares this window against the prior 7 days.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_marketplace_buys_7d`,
};
export default metric;
