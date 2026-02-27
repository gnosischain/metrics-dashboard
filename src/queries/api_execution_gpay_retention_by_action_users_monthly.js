const metric = {
  id: 'api_execution_gpay_retention_by_action_users_monthly',
  name: 'Retention Cohort Users by Action',
  description: 'Monthly active users by cohort',
  metricDescription: 'Stacked cohort user activity over time. Filter by action type.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'action',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT action, date, label, value
    FROM dbt.api_execution_gpay_retention_by_action_users_monthly
    ORDER BY
      if(action = 'Payment', 0, 1),
      date ASC,
      label ASC
  `,
};

export default metric;
