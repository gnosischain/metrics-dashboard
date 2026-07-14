const metric = {
  id: 'api_execution_gnosis_app_kpi_weekly_economically_active_users_latest',
  name: 'WEAU',
  description: 'Latest week',
  metricDescription: `**Weekly Economically Active Users**: addresses that were both active in the Gnosis App AND earned at least one Circles reward in the same latest complete week, making WEAU a strict subset of WAU (so WEAU/WAU is an activation rate). A **reward** is a \`gcrc_cashback\` payout (credited to any Gnosis App user) or an \`inviter_fee\` where at least one fee that week arrived through a Gnosis-App relayer transaction (\`any_in_app_tx = 1\`). Blacklisted addresses (\`stg_crawlers_data__circles_blacklisted\`) are excluded and the in-progress week is dropped; \`change_pct\` is week-over-week. \`count\``,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior week' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_weekly_economically_active_users_latest`,
};
export default metric;
