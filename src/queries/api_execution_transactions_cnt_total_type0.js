const metric = {
  id: 'api_execution_transactions_cnt_total_type0',
  name: 'Type-0',
  description: 'Total',
  format: 'formatNumber',
  fontSize: '2rem',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default', 
  query: `SELECT value FROM dbt.api_execution_transactions_cnt_total where transaction_type = '0'`,
};

export default metric;