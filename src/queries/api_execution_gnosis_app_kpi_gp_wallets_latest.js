const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_latest',
  name: 'GP Wallets on GA',
  description: 'Currently GA-owned (subset of ever)',
  metricDescription: `Current number of Gnosis Pay cards controlled by a Gnosis App user. A card counts when at least one **Gnosis App user** address is presently enabled as an owner module on the card's Safe Delay Module (\`is_currently_ga_owned\`); a Gnosis App user is an address flagged by on-chain heuristics such as Cometh ERC-4337 bundler UserOps (\`int_execution_gnosis_app_users_current\`). June-2026 migrated pairs (an old Safe plus its inherited new Safe) are collapsed to one \`canonical_address\` so a migrated card is not double-counted. Latest snapshot; a distinct-card count, not USD.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_latest`,
};
export default metric;
