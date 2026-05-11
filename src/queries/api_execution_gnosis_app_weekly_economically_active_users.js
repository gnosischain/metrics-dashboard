const metric = {
  id: 'api_execution_gnosis_app_weekly_economically_active_users',
  name: 'Weekly Economically Active Users',
  description: 'WAU ∩ Circles reward earners',
  metricDescription: 'Subset of Weekly Active Users that also earned ≥1 gCRC cashback OR ≥1 CRC inviter fee in the same week. Split by blacklist flag.',
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
