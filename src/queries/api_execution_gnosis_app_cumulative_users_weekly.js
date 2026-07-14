const metric = {
  id: 'api_execution_gnosis_app_cumulative_users_weekly',
  name: 'Cumulative Users',
  description: 'Weekly',
  metricDescription: `Running total of distinct Gnosis App users, accumulated to the end of each week (never decreases). A **Gnosis App user** is an address whose on-chain actions are relayed by the Cometh ERC-4337 bundler — the app's on-chain fingerprint — and each user is added in the week of their \`first_seen_at\` (their earliest such event). Weeks are UTC, Monday-aligned; the current, incomplete week is excluded. Counts unique addresses, not activity or transactions.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  format: 'formatNumber',
  query: `
    SELECT toDate(week) AS date, cumulative_users AS value
    FROM dbt.api_execution_gnosis_app_users_weekly
    ORDER BY date ASC
  `,
};
export default metric;
