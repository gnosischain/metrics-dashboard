const metric = {
  id: 'api_execution_gpay_cashback_cohort_retention_users_monthly',
  name: 'Cashback Cohort Users',
  description: 'Monthly active users by cashback cohort',
  metricDescription: 'Stacked cohort user activity over time for first-cashback cohorts.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_cashback_cohort_retention_users_monthly
    ORDER BY date ASC, label ASC
  `,
};

export default metric;
