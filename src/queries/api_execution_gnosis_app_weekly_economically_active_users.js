const metric = {
  id: 'api_execution_gnosis_app_weekly_economically_active_users',
  name: 'Weekly Economically Active Users',
  description: 'WAU ∩ Circles reward earners',
  metricDescription: `**Weekly Economically Active Users (WEAU).** Gnosis App in-app WAU that ALSO earned a Circles reward the same week — the **in-app earner base** (a \`gcrc_cashback\` payout to a Gnosis App member, or an \`inviter_fee\` with ≥ 1 fee that week via a Gnosis App relayer tx) intersected with in-app WAU activity. That same in-app earner base is the **In-app** line of the Circles "Economically Active Avatars" card, so WEAU ≤ that In-app line; earnings via other apps or direct on-chain do not count. WEAU / WAU is the app's activation rate. Bars split by the Circles blacklist flag — **Not blacklisted** vs **Blacklisted** (\`stg_crawlers_data__circles_blacklisted\`); the headline KPI counts the not-blacklisted set. Weeks start Monday and the current incomplete week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'week',
  yField: 'cnt',
  seriesField: 'is_blacklisted',
  seriesColorsByName: { 'Not blacklisted': '#7B3FE4', Blacklisted: '#94a3b8' },
  tooltipOrder: 'valueDesc',
  query: `
    SELECT week, if(is_blacklisted, 'Blacklisted', 'Not blacklisted') AS is_blacklisted, cnt
    FROM dbt.api_execution_gnosis_app_weekly_economically_active_users
    ORDER BY week
  `,
};
export default metric;
