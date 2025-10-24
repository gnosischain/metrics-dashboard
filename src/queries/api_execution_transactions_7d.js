const metric = {
  id: 'api_execution_transactions_7d',
  name: 'Transactions Count',
  description: 'Last 7 days',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default', 
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_execution_transactions_7d`,
};

export default metric;