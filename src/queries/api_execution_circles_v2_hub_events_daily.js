const metric = {
  id: 'api_execution_circles_v2_hub_events_daily',
  name: 'Hub Events',
  description: 'Daily Circles v2 Hub event mix',
  metricDescription: `Daily number of Circles v2 Hub contract events, broken down by \`event_name\` (e.g. \`RegisterHuman\`, \`RegisterGroup\`, \`Trust\`, \`TransferSingle\`). \`n_events\` counts individual emitted logs (distinct \`transaction_hash\` + \`log_index\`), so several events in one transaction each count separately. Stack the bars for the event-type mix over time, or filter \`event_name\` to isolate one stream. Daily grain; the current incomplete day is excluded.`,
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
