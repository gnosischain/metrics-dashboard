const metric = {
  id: 'overview_transactions',
  name: 'Transactions',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.3rem', 
  fontSize: '2.6rem',      
  query: `SELECT CONCAT('+',toString(floor(value/1000000)), 'M') AS value FROM dbt.api_execution_transactions_total`
};

export default metric;