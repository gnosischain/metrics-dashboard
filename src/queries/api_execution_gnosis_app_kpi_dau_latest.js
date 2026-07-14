const metric = {
  id: 'api_execution_gnosis_app_kpi_dau_latest',
  name: 'DAU',
  description: 'Latest day',
  metricDescription: `Daily Active Users: distinct Gnosis App addresses with at least one real, non-onboarding action on the latest complete day (\`today\` is excluded as incomplete). Counted actions include a swap (signed or filled), a Gnosis Pay top-up, a marketplace buy, a token-offer claim, or a heuristic app event; the synthetic \`onboard\` first-seen marker is excluded so a user is never counted active from onboarding alone. \`change_pct\` compares to the prior day.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior day' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_dau_latest`,
};
export default metric;
