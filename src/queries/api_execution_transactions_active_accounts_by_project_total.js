// active accounts pie
const metric = {
  id: 'api_execution_transactions_active_accounts_by_project_total',
  name: 'Active Accounts by Project (Total)',
  chartType: 'pie',
  nameField: 'label',          
  valueField: 'value',
  query: `SELECT project AS label, value FROM dbt.api_execution_transactions_active_accounts_by_project_total`,
};
export default metric;