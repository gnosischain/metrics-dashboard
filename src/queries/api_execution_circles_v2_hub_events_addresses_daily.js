const metric = {
  id: 'api_execution_circles_v2_hub_events_addresses_daily',
  name: 'Hub Distinct Addresses',
  description: 'Daily distinct addresses per Hub event',
  metricDescription: 'Daily distinct addresses participating in each Circles v2 Hub event (avatar / inviter / group / org / truster / trustee / from / to / human / account / backer / holder). Lets you see which event types are touching the largest user populations.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_distinct_addresses',
  seriesField: 'event_name',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, event_name, n_distinct_addresses
    FROM dbt.api_execution_circles_v2_hub_events_daily
    ORDER BY date
  `,
};
export default metric;
