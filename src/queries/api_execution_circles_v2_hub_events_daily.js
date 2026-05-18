const metric = {
  id: 'api_execution_circles_v2_hub_events_daily',
  name: 'Hub Events',
  description: 'Daily Circles v2 Hub event mix',
  metricDescription: 'Daily count of every Circles v2 Hub event, broken down by event_name. Stack to see the event-type mix over time; use the event_name filter to isolate a single stream.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_events',
  seriesField: 'event_name',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT date, event_name, n_events
    FROM dbt.api_execution_circles_v2_hub_events_daily
    ORDER BY date
  `,
};
export default metric;
