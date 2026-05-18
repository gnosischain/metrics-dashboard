// Lightweight (avatar, display_name) lookup used by the global filter on
// the Circles dashboard's Avatar tab to support searching avatars by
// display name OR address. NOT rendered as a panel — it lives in the
// metric registry purely so metricsService can fetch it.
const metric = {
  id: 'api_execution_circles_v2_avatar_search',
  name: 'Avatar Search Index',
  description: 'Internal lookup of (avatar, display_name) for the Avatar tab global filter.',
  chartType: 'table',
  hidden: true,

  query: `
    SELECT avatar, display_name
    FROM dbt.api_execution_circles_v2_avatar_search
  `,
};

export default metric;
