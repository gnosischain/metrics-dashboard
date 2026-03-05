const metric = {
  id: 'api_execution_yields_lending_activity_counts_weekly',
  name: 'Aave V3 Lenders & Borrowers Count',
  description: 'Weekly unique lenders and borrowers count',
  metricDescription: 'Weekly unique lender and borrower counts by token and protocol. Token filter isolates participation dynamics for a selected asset.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 60,
    end: 100,
  },
  xField: 'date',
  yField: 'value',
  seriesField: 'activity_type',
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.8,
  query: `SELECT * FROM dbt.api_execution_yields_lending_activity_counts_weekly`,
};

export default metric;
