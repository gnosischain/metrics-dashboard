// api_bridges__kpi_distinct_bridges_all_time.js
const metric = {
  id: 'api_bridges_kpi_distinct_bridges_all_time',
  name: 'Distinct Bridges',
  description: 'All time',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT value
    FROM dbt.api_bridges_kpi_distinct_bridges_all_time
  `,
};
export default metric;