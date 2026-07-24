const metric = {
  id: 'api_execution_transactions_by_project_ranges_top20',
  name: 'Transactions by Project',
  description: 'Select range',
  metricDescription: 'Select a window (All, 7D, 30D, 90D) to recompute the top 20 projects by transaction count. Projects outside the top 20 are grouped into Others.',
  chartType: 'pie',
  nameField: 'label',
  valueField: 'value',
  enableFiltering: true,
  labelField: 'range',
  format: 'formatNumber',
  legend: { top: 'top', left: 'center', type: 'scroll', itemGap: 16 },
  showLabels: true,
  // Callouts only for larger slices; scroll legend still lists every project.
  minLabelPercent: 2.5,
  labelFormatter: '{b}: {c} ({d}%)',
  sortByValue: 'desc',
  query: `SELECT * FROM dbt.api_execution_transactions_by_project_ranges_top20`,
};

export default metric;
