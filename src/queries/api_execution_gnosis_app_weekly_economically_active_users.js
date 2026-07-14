const metric = {
  id: 'api_execution_gnosis_app_weekly_economically_active_users',
  name: 'Weekly Economically Active Users',
  description: 'WAU ∩ Circles reward earners',
  metricDescription: `**Weekly Economically Active Users (WEAU).** The subset of the Gnosis App in-app WAU that ALSO earned at least one Circles reward in the same week — a \`gcrc_cashback\` payout (scoped by Gnosis App membership) or an \`inviter_fee\` where at least one fee that week came through a Gnosis App relayer tx; earnings via other apps or direct on-chain do not count. WEAU / WAU is the app's activation rate. Bars split by the Circles blacklist flag: **Active** = not blacklisted, **Blacklisted** = address on the Circles blacklist (\`stg_crawlers_data__circles_blacklisted\`). Weeks start Monday and the current incomplete week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'week',
  yField: 'cnt',
  seriesField: 'is_blacklisted',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT week, if(is_blacklisted, 'Blacklisted', 'Active') AS is_blacklisted, cnt
    FROM dbt.api_execution_gnosis_app_weekly_economically_active_users
    ORDER BY week
  `,
};
export default metric;
