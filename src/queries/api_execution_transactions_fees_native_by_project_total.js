const metric = {
  id: 'api_execution_transactions_fees_native_by_project_total',
  name: 'Total Fees by Project',
  description: 'All Time, in xDAI',
  chartType: 'pie',
  nameField: 'label',         
  valueField: 'value',
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_by_project_total`,
};
export default metric;