const metric = {
  id: 'api_execution_transactions_active_accounts_by_project_ranges_top20',
  name: 'Initiator Accounts by Project',
  description: 'Select range',
  metricDescription: 'Select a window (All, 7D, 30D, 90D) to recompute the top 20 projects by unique initiator accounts. Projects outside the top 20 are grouped into Others.',
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