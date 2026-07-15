const metric = {
  id: 'api_execution_gnosis_app_gt_swaps',
  name: 'Swaps by App Scope',
  description: 'CoW swaps by app scope and status',
  metricDescription: `CoW Protocol swap orders attributed to each app scope, split by CoW order \`status\` (a real enum: \`Filled\`, \`Expired\`, \`Open\`, \`Cancelled\`, ...). \`app_scope\` is derived from each order's \`appCode\` metadata: \`app.gnosis.io\` is the current Gnosis App (\`gnosis_app\`), \`app.metri.xyz\` is the legacy Metri app (\`metri\`), test codes are \`test\`, empty metadata is \`unknown\`, and everything else is \`third_party\`. The grain is one CoW order (not fills or settled volume); \`gnosis_app\` and \`metri\` are two different apps, so do not sum them for current-app-only reporting. Sourced from the ground-truth \`envio_ga\` indexer.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: true,
  xField: 'app_scope',
  yField: 'n_swaps',
  seriesField: 'status',
  format: 'formatNumber',
  query: `
    SELECT app_scope, status, n_swaps
    FROM dbt.api_execution_gnosis_app_gt_swaps
    ORDER BY app_scope, status
  `,
};
export default metric;
