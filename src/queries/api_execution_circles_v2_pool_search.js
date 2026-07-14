// Lightweight (pool_address, display_name) lookup used by the global filter on
// the Circles Pool Explorer tab to support picking a pool by name or address.
// NOT rendered as a panel — it lives in the registry so metricsService can fetch
// it for the search dropdown.
const metric = {
  id: 'api_execution_circles_v2_pool_search',
  name: 'Pool Search Index',
  description: 'Internal lookup of (pool_address, display_name) for the Pool Explorer global filter.',
  chartType: 'table',
  hidden: true,

  query: `
    SELECT pool_address, display_name
    FROM dbt.api_execution_circles_v2_pool_search
  `,
};

export default metric;
