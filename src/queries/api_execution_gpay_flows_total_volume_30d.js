const metric = {
  id: 'api_execution_gpay_flows_total_volume_30d',
  name: 'Last 30 Days',
  description: 'Total flow',
  chartType: 'numberDisplay',
  variant: 'standard',
  format: null,
  valueField: 'total_usd',
  query: `
    SELECT CONCAT('+$',toString(floor(SUM(amount_usd)/1000000)), 'M')  AS total_usd FROM dbt.api_execution_gpay_flows_snapshot
    WHERE window = '30D'
  `
};
export default metric