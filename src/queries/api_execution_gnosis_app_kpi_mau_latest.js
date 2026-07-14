const metric = {
  id: 'api_execution_gnosis_app_kpi_mau_latest',
  name: 'MAU',
  description: 'Latest month',
  metricDescription: `**MAU** = distinct \`Gnosis App\` addresses with at least one non-onboarding action in the latest *complete* calendar month; the still-open current month is excluded. A **Gnosis App user** is an address the Cometh ERC-4337 bundler relayed activity for (the app's on-chain fingerprint). Any \`activity_kind\` other than \`onboard\` counts as active — a Cometh-relayed heuristic hit, a signed or filled CoW swap, a Gnosis Pay top-up, a marketplace buy, or a token-offer claim; the synthetic \`onboard\` first-seen marker alone does not. Change is vs the prior month.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior month' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_mau_latest`,
};
export default metric;
