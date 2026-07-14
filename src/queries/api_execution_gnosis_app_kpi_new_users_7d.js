const metric = {
  id: 'api_execution_gnosis_app_kpi_new_users_7d',
  name: 'New Users',
  description: 'Last 7 days',
  metricDescription: `Count of addresses onboarding to the \`Gnosis App\` for the first time in the last 7 full days (today excluded). An address's onboarding day is its \`first_seen_at\` — the date of its earliest Cometh-relayed heuristic hit (the app's on-chain fingerprint, e.g. a Safe created with the Circles invitation module, a personal mint, or a top-up). Each address is counted once, on that first-seen day only. Change is vs the prior 7 days.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_new_users_7d`,
};
export default metric;
