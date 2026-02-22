const metric = {
  id: 'overview_payments',
  name: 'Payments Volume',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.3rem', 
  fontSize: '2.6rem',    
  query: `SELECT CONCAT('+$',toString(floor(value/1000000)), 'M') AS value FROM dbt.api_execution_gpay_total_volume`
};

export default metric;
