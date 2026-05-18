const metric = {
  id: 'api_execution_circles_v2_invite_funnel_cohort_monthly',
  name: 'Invite Funnel',
  description: 'Invitee cohort cadence drop-off',
  metricDescription: 'For each invitation-month cohort, the five-stage drop-off in mint cadence: Invited → ≥2 mint days in first 30d → ≥7 → ≥14 → Active Minter (canonical: mint_days_14dw = 14 AND mint_14dw ≥ 80% of 336). Skips the trivial acceptance mint that fires for every accepted invite.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'cohort_month',
  yField: 'value',
  seriesField: 'stage',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT cohort_month, 'Invited'         AS stage, toUInt64(n_invited)         AS value FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    UNION ALL
    SELECT cohort_month, '≥2 mint-days'    AS stage, toUInt64(n_minted_2_days)   AS value FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    UNION ALL
    SELECT cohort_month, '≥7 mint-days'    AS stage, toUInt64(n_minted_7_days)   AS value FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    UNION ALL
    SELECT cohort_month, '≥14 mint-days'   AS stage, toUInt64(n_minted_14_days)  AS value FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    UNION ALL
    SELECT cohort_month, 'Active Minter'   AS stage, toUInt64(n_active_minter)   AS value FROM dbt.api_execution_circles_v2_invite_funnel_cohort_monthly
    ORDER BY cohort_month, stage
  `,
};
export default metric;
