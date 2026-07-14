const metric = {
  id: 'api_execution_gnosis_app_churn_monthly_chart',
  name: 'User Segments',
  description: 'Monthly — new / retained / returning / churned',
  metricDescription: `Monthly segmentation of Gnosis App users by activity state (distinct addresses). **Active** = at least one non-\`onboard\` action that month — a swap, top-up, marketplace buy, token-offer claim, or a Cometh-relayed on-chain event; pure onboarding does not count. **New** = the user's first-ever active month is this month; **Retained** = active this month and the prior month; **Returning** = active this month and earlier but not the prior month (a reactivation); **Churned** = active this month but not the following month. Uses the \`Any\`-activity scope (a swap-only scope exists in the model but is not shown here); the current, incomplete month is excluded.`,
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
