const metric = {
  id: 'api_execution_transactions_fees_native_by_project_ranges_top20',
  name: 'Fees by Project (xDAI)',
  description: 'Select range',
  metricDescription: 'Select a window (All, 7D, 30D, 90D) to recompute the top 20 projects by total fees in xDAI. Projects outside the top 20 are grouped into Others.',
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
  tooltipValueSuffix: ' xDAI',
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_by_project_ranges_top20`,
};

export default metric;