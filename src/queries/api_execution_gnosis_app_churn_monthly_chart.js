const metric = {
  id: 'api_execution_gnosis_app_churn_monthly_chart',
  name: 'User Segments',
  description: 'Monthly — new / retained / returning / churned',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  format: 'formatNumber',
  query: `
    SELECT toDate(month) AS date, 'New'        AS label, new_users        AS value
    FROM dbt.api_execution_gnosis_app_churn_monthly WHERE scope = 'Any'
    UNION ALL SELECT toDate(month) AS date, 'Retained'   AS label, retained_users   AS value
    FROM dbt.api_execution_gnosis_app_churn_monthly WHERE scope = 'Any'
    UNION ALL SELECT toDate(month) AS date, 'Returning' AS label, returning_users  AS value
    FROM dbt.api_execution_gnosis_app_churn_monthly WHERE scope = 'Any'
    UNION ALL SELECT toDate(month) AS date, 'Churned'    AS label, churned_users    AS value
    FROM dbt.api_execution_gnosis_app_churn_monthly WHERE scope = 'Any'
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
