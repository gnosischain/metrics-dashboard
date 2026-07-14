const metric = {
  id: 'api_execution_gnosis_app_kpi_token_offer_claims_7d',
  name: 'Token Offer Claims (7d)',
  description: 'Last 7 days',
  metricDescription: `Number of token-offer claims by Gnosis App users in the last 7 full days (rolling window ending yesterday), compared with the prior 7 days. A **claim** is one \`OfferClaimed\` event on an \`ERC20TokenOfferCycle\` contract — a user spending CRC to receive an offer token (GNO today) — counted only when relayed by an active Cometh bundler to the ERC-4337 \`EntryPoint\` for an address in \`int_execution_gnosis_app_users_current\`. This counts events (\`sum(n_claims)\`), so one user claiming multiple times is counted multiple times.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_token_offer_claims_7d`,
};
export default metric;
