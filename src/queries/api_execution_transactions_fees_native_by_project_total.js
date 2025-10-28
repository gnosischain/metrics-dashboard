// fees pie
const metric = {
  id: 'api_execution_transactions_fees_native_by_project_total',
  name: 'Fees by Project (Total)',
  chartType: 'pie',
  nameField: 'label',          // 👈 add this
  valueField: 'value',
  query: `SELECT project AS label, value FROM dbt.api_execution_transactions_fees_native_by_project_total`,
};
export default metric;