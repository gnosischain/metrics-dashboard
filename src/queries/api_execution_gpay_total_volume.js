const metric = {
  id: 'api_execution_gpay_total_volume',
  name: 'Total Volume',
  description: 'All-time',
  chartType: 'numberDisplay',
  variant: 'default',
  format: null,
  valueField: 'value',
  query: `SELECT CONCAT('+',toString(floor(value/1000000)), 'M') AS value FROM dbt.api_execution_gpay_total_volume`,
};
export default metric;
