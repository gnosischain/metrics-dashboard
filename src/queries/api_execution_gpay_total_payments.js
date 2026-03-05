const metric = {
  id: 'api_execution_gpay_total_payments',
  name: 'Payments',
  description: 'All-time',
  metricDescription: `
  Cumulative card payment count since inception. 
  
  Counts only wallet-to-merchant transfers (card spend).`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: null,
  valueField: 'value',
  query: `SELECT CONCAT('+',toString(floor(value/1000000)), 'M') AS value FROM dbt.api_execution_gpay_total_payments`,
};
export default metric;
