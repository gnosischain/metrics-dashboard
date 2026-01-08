const metric = {
  id: 'api_execution_transactions_active_accounts_total',
  name: 'Initiator Accounts',
  description: 'All-time',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT * FROM dbt.api_execution_transactions_active_accounts_total`,
};
export default metric; 