const metric = {
  id: 'api_bridges_kpi_total_netflow_all_time',
  name: 'Total Netflow',
  description: 'All time',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  query: `
    SELECT value
    FROM dbt.api_bridges_kpi_total_netflow_all_time
  `,
};
export default metric;