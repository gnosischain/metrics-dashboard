const metric = {
  id: 'api_crawlers_data_distinct_sectors_total',
  name: 'Distinct Sectors',
  description: 'All-time',
  valueField: 'value2',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT value2 FROM dbt.api_crawlers_data_distinct_projects_sectors_totals`,
};
export default metric; 