const metric = {
  id: 'api_execution_circles_v2_invite_funnel_cohort_monthly',
  name: 'Invite Funnel',
  description: 'Invitee cohort by month: minted at least once',
  metricDescription: 'Cohort of invited humans by month of invitation. Shows total invited, how many minted at least once, conversion pct, and the p25/median/p75 days from invite to first mint.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'cohort_month',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT cohort_month, 'Invited' AS label, n_invited AS value
    FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    UNION ALL
    SELECT cohort_month, 'Minted ≥1' AS label, n_minted_at_least_once AS value
    FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    ORDER BY cohort_month, label
  `,
};
export default metric;
