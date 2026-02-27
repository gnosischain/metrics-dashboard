const metric = {
  id: 'api_execution_gpay_churn_monthly',
  name: 'Lifecycle Segments',
  description: 'New, retained, returning, churned',
  metricDescription: 'Monthly lifecycle segmentation. Filter by scope (Payment vs Any activity).',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'scope',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT scope, toDate(month) AS date, 'New' AS label, new_users AS value
    FROM dbt.api_execution_gpay_churn_monthly

    UNION ALL

    SELECT scope, toDate(month) AS date, 'Retained' AS label, retained_users AS value
    FROM dbt.api_execution_gpay_churn_monthly

    UNION ALL

    SELECT scope, toDate(month) AS date, 'Returning' AS label, returning_users AS value
    FROM dbt.api_execution_gpay_churn_monthly

    UNION ALL

    SELECT scope, toDate(month) AS date, 'Churned' AS label, churned_users AS value
    FROM dbt.api_execution_gpay_churn_monthly

    ORDER BY
      if(scope = 'Payment', 0, 1),
      date ASC,
      multiIf(
        label = 'New', 1,
        label = 'Retained', 2,
        label = 'Returning', 3,
        label = 'Churned', 4,
        99
      )
  `,
};

export default metric;
