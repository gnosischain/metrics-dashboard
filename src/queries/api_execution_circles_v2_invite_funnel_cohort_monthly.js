const metric = {
  id: 'api_execution_circles_v2_invite_funnel_cohort_monthly',
  name: 'Invite Funnel',
  description: 'Invitee cohort cadence drop-off',
  metricDescription: `Monthly cohort funnel showing mint-cadence drop-off among invited humans, grouped by the month they were invited (\`toStartOfMonth(invited_at)\`). An invited human is a \`Human\` avatar whose \`invited_by\` is a real address (non-zero), i.e. onboarded through an accepted invite. Five stages: **Invited** → **≥2 / ≥7 / ≥14 mint-days** (distinct days with a personal \`personalMint\` in the first 30 days — group mints and migration backfills are excluded; the acceptance-day mint counts as day one, so ≥2 means at least one genuine return day) → **Active Minter** (ever reached the canonical \`mint_days_14dw = 14\` AND \`mint_14dw ≥ 80% of 336\`). Values are counts of avatars per stage; cohorts with \`invited_at\` today are excluded.`,
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
