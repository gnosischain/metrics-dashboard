const metric = {
  id: 'api_execution_gnosis_app_weekly_active_users',
  name: 'Weekly Active Users',
  description: 'New / returning / reactivated, with the Active total',
  metricDescription: `Weekly composite users for the Gnosis App (Circles + CoW + gPay). Bars stack **New**, **Returning** and **Reactivated**; the line is total **Active** WAU — distinct addresses that took at least one non-onboarding in-app action in the week. Active also counts users outside the three buckets, so it sits above the stack. Weeks start Monday; the current incomplete week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  format: 'formatNumber',
  seriesColorsByName: { New: '#22c55e', Returning: '#3b82f6', Reactivated: '#f59e0b' },
  lineOverlayField: 'active',
  lineOverlayLabel: 'Active',
  lineOverlayColor: '#111827',
  query: `
    SELECT * FROM (
      SELECT toDate(week) AS date, 'New'         AS label, new_users         AS value, active_users AS active FROM dbt.api_execution_gnosis_app_weekly_active_users
      UNION ALL SELECT toDate(week), 'Returning',   returning_users,   active_users FROM dbt.api_execution_gnosis_app_weekly_active_users
      UNION ALL SELECT toDate(week), 'Reactivated', reactivated_users, active_users FROM dbt.api_execution_gnosis_app_weekly_active_users
    )
    ORDER BY date ASC, label ASC
  `,
};

export default metric;
