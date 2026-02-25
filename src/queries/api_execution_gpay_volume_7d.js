const metric = {
  id: 'api_execution_gpay_volume_7d',
  name: 'Payments Volume',
  description: 'Last 7 days',
  chartType: 'numberDisplay',
  variant: 'default',
  format: null,
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT CONCAT('+$',toString(round(value/1000000,2)), 'M') AS value, change_pct FROM dbt.api_execution_gpay_volume_7d`,
};
export default metric;
