const metric = {
  id: 'api_execution_transactions_active_accounts_by_project_total',
  name: 'Total Initiator Accounts by Project',
  description: 'All Time',
  chartType: 'pie',
  nameField: 'label',          
  valueField: 'value',
  format: 'formatNumber',
  query: `SELECT * FROM dbt.api_execution_transactions_active_accounts_by_project_total`,
};
export default metric;