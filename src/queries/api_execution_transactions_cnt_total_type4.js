const metric = {
  id: 'api_execution_transactions_cnt_total_type4',
  name: 'Total Txs: Type-4',
  format: 'formatNumber',
  fontSize: '2rem',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'compact', 
  query: `SELECT value FROM dbt.api_execution_transactions_cnt_total where transaction_type = '4'`,
};

export default metric;