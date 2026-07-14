// Lightweight (group_address, display_name) lookup used by the global filter
// on the Circles Group Explorer tab to support searching groups by display
// name OR address. NOT rendered as a panel — it lives in the registry purely
// so metricsService can fetch it for the search dropdown.
const metric = {
  id: 'api_execution_circles_v2_group_search',
  name: 'Group Search Index',
  description: 'Internal lookup of (group_address, display_name) for the Group Explorer global filter.',
  chartType: 'table',
  hidden: true,

  query: `
    SELECT group_address, display_name
    FROM dbt.api_execution_circles_v2_group_search
  `,
};

export default metric;
