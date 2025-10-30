const metric = {
  id: 'api_execution_transactions_active_accounts_by_project_ranges_top20',
  name: 'Active Accounts by Project',
  description: 'Select range',
  chartType: 'pie',
  nameField: 'label',
  valueField: 'value',
  enableFiltering: true,
  labelField: 'range',
  format: 'formatNumber',
  legend: { top: 'top', left: 'center', type: 'scroll', itemGap: 16 },
  donut: true,
  showLabels: true,
  labelFormatter: '{b}: {c} ({d}%)',
  sortByValue: 'desc',
  query: `SELECT * FROM dbt.api_execution_transactions_active_accounts_by_project_ranges_top20`,
};

export default metric;