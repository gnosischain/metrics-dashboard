const metric = {
  id: 'api_execution_gnosis_app_activity_by_action_weekly',
  name: 'Activity by Action',
  description: 'Weekly actions by kind',
  metricDescription: 'Weekly Gnosis App activity segmented by activity_kind (swap_signed, swap_filled, topup, marketplace_buy, circles_trust, etc.).',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_events',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  valueModeOptions: [
    { key: 'n_events', label: 'Events',      valueField: 'n_events', format: 'formatNumber' },
    { key: 'n_users',  label: 'Unique Users', valueField: 'n_users',  format: 'formatNumber' },
  ],
  defaultValueMode: 'n_events',
  query: `
    SELECT toDate(week) AS date, activity_kind AS label, n_events, n_users
    FROM dbt.api_execution_gnosis_app_activity_by_action_weekly
    WHERE activity_kind != 'onboard'
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
