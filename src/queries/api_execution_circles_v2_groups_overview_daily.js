const metric = {
  id: 'api_execution_circles_v2_groups_overview_daily',
  name: 'Groups Overview',
  description: 'New groups + collateral activity per day',
  metricDescription: 'Daily Circles v2 group network metrics: new group registrations, cumulative group total, collateral events (StandardTreasury lock / burn / return), and distinct groups touching collateral that day.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_groups_total',
  unitFields: {
    cumulative_groups:  { field: 'n_groups_total', format: 'formatNumber' },
    new_groups:         { field: 'n_new_groups',   format: 'formatNumber' },
    collateral_events:  { field: 'n_collateral_events', format: 'formatNumber' },
    active_groups:      { field: 'n_distinct_groups_acting', format: 'formatNumber' },
  },
  query: `
    SELECT
      date,
      n_new_groups,
      n_collateral_events,
      n_distinct_groups_acting,
      n_groups_total
    FROM dbt.api_execution_circles_v2_groups_overview_daily
    ORDER BY date
  `,
};
export default metric;
