const metric = {
  id: 'api_execution_gnosis_app_kpi_weekly_active_users_latest',
  name: 'WAU',
  description: 'Latest week',
  metricDescription: `**Weekly Active Users** for the Gnosis App: distinct addresses that took at least one non-onboarding action in the latest complete week (weeks start Monday; the in-progress week is excluded). An **action** is any Cometh-relayed Circles heuristic (register / trust / personal mint / invite / fee / profile update), a Cometh-routed CoW swap (signed or filled), a Gnosis Pay top-up, a marketplace buy, or a token-offer claim — the \`onboard\` event itself does not count. This is the app-scoped signal, a strict subset of the wider Circles-ecosystem WAU (a separate metric); no blacklist filter is applied. \`change_pct\` is versus the prior week. \`count\``,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior week' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_weekly_active_users_latest`,
};
export default metric;
