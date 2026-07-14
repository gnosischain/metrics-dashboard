const metric = {
  id: 'api_execution_gnosis_app_kpi_token_offer_claimers_7d',
  name: 'Token Offer Claimers',
  description: 'Last 7 days',
  metricDescription: `Distinct Gnosis App users who claimed at least one token offer in the last 7 full days (rolling window ending yesterday; today's partial day is excluded). A **claim** is an \`OfferClaimed\` event on an \`ERC20TokenOfferCycle\` contract where the user spends CRC to receive an offer token (GNO today). The claiming \`account\` counts as a **Gnosis App user** only if it appears in \`int_execution_gnosis_app_users_current\` and the transaction was relayed by an active Cometh bundler to the ERC-4337 \`EntryPoint\`. Counts distinct addresses (\`countDistinct(ga_user)\`), not individual claims.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_token_offer_claimers_7d`,
};
export default metric;
