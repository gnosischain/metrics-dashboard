const metric = {
  id: 'api_crawlers_data_distinct_projects_total',
  name: 'Distinct Projects',
  description: 'All-time',
  valueField: 'value1',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT value1 FROM dbt.api_crawlers_data_distinct_projects_sectors_totals`,
};
export default metric; 