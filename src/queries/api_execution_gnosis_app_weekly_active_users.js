const metric = {
  id: 'api_execution_gnosis_app_weekly_active_users',
  name: 'Weekly Active Users',
  description: 'Composite WAU (Circles + CoW + gPay)',
  metricDescription: 'Distinct addresses active each week across the three Gnosis App composite signals (Circles v2 avatar activity, Cometh-routed CoW swaps, Gnosis App user activity). Split by blacklist flag (matches the Dune circles-v2-kpis dashboard).',
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
    FROM dbt.api_execution_gnosis_app_weekly_active_users
    ORDER BY week
  `,
};
export default metric;
