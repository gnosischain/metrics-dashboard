const metric = {
  id: 'api_execution_circles_v2_backing_events_daily',
  name: 'Backing Events',
  description: 'Daily backing-lifecycle events by stage',
  metricDescription: 'Daily count of Circles v2 backing-lifecycle events (initiated / deployed / lbp_deployed / completed / released / asset_status_updated / global_release_updated). Tracks depositors — addresses that pledged collateral. Distinct from the trust-defined backers set.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_events',
  seriesField: 'lifecycle_stage',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT date, lifecycle_stage, n_events
    FROM dbt.api_execution_circles_v2_backing_events_daily
    ORDER BY date
  `,
};
export default metric;
