// transactions pie
const metric = {
  id: 'api_execution_transactions_by_project_total',
  name: 'Transactions by Project (Total)',
  chartType: 'pie',
  nameField: 'label',          
  valueField: 'value',
  query: `SELECT * FROM dbt.api_execution_transactions_by_project_total`,
};
export default metric;