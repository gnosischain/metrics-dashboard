const metric = {
  id: 'api_execution_circles_v2_hub_events_addresses_daily',
  name: 'Hub Distinct Addresses',
  description: 'Daily distinct addresses per Hub event',
  metricDescription: `Daily count of distinct addresses touched by each Circles v2 Hub contract event type (\`event_name\`, e.g. \`RegisterHuman\`, \`Trust\`, \`TransferSingle\`). An address counts for an event if it appears in ANY of that event's participant fields — \`avatar\`, \`inviter\`, \`group\`, \`organization\`, \`truster\`, \`trustee\`, \`operator\`, \`from\`, \`to\`, \`human\`, \`account\`, \`backer\`, or \`holder\`; the zero-address sentinel and empty values are excluded. Deduplicated within each \`event_name\` but not across them, so one address can appear under several event types. Daily grain; the current incomplete day is excluded.`,
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
