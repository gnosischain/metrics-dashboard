const metric = {
  id: 'api_execution_gpay_flows_total_volume_1d',
  name: 'Last Day',
  description: 'Total flow',
  chartType: 'numberDisplay',
  variant: 'standard',
  format: null,
  valueField: 'total_usd',
  query: `
    SELECT CONCAT('+$',toString(floor(SUM(amount_usd)/1000)), 'K')  AS total_usd FROM dbt.api_execution_gpay_flows_snapshot
    WHERE window = '1D'
  `
};
export default metric
