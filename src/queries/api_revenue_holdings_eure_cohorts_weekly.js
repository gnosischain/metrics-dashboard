const metric = {
  id: 'api_revenue_holdings_eure_cohorts_weekly',
  name: 'EURe Holdings — Rolling 52w Cohorts',
  description: 'Trailing-year imputed interest from EURe balances, bucketed by per-user annual revenue.',
  metricDescription:
    'Per user per day we compute **balance_usd × 9.6e-6** (0.351% APY expressed per-day). Daily fees are summed per user to the week, then trailing 52 **calendar** weeks are summed per user-week (dense calendar — gaps count as $0). Users are bucketed by their annualised total ($1–3, $3–6, $6–10, $10–100, ≥$100). Wrapped variants (aGnoEURe, spEURe) are folded into EURe. These are **potential** DAO-accruable fees. ' +
    'This view is distinct from the monthly view — not an aggregate of it.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'week',
  yField: 'annual_rolling_fees_total',
  seriesField: 'cohort',
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt',                 format: 'formatNumber',   label: '#' },
    fees:  { field: 'annual_rolling_fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT week, cohort, annual_rolling_fees_total, users_cnt
    FROM dbt.api_revenue_holdings_eure_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
