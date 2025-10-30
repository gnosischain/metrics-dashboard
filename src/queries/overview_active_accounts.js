const metric = {
  id: 'overview_active_accounts',
  name: 'Weekly Users',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.5rem', 
  fontSize: '3rem',    
  query: `SELECT  CONCAT('+',toString(floor(value/1000)), 'K') AS value FROM dbt.api_execution_transactions_active_accounts_7d`
};

export default metric;