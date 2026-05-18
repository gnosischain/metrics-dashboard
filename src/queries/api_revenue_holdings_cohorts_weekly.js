const metric = {
  id: 'api_revenue_holdings_cohorts_weekly',
  name: 'Holdings Revenue — Rolling 52w Cohorts',
  description: 'Trailing-year imputed interest from EURe / USDC.e / BRLA / ZCHF balances, bucketed by per-user annual revenue.',
  metricDescription:
    'Per user per day we compute an imputed daily fee as **balance_usd × daily_rate**, where the daily rate is the symbol\'s annualised APY expressed per-day:\n\n' +
    '- **EURe** — 0.351% APY\n' +
    '- **USDC.e** — 0.351% APY\n' +
    '- **BRLA** — 2.07% APY\n' +
    '- **ZCHF** — 0.5% APY\n\n' +
    'Daily fees are summed per user to the week, then trailing 52 weeks are summed for each user-week. Users are bucketed by their annualised total ($1–3, $3–6, $6–10, $10–100, ≥$100). These are **potential** DAO-accruable fees — the share actually captured depends on future policy.\n\n' +
    'Wrapped variants (aGno*, sp*, svZCHF) are folded into the canonical symbol. ' +
    'This view is distinct from the monthly view — not an aggregate of it.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'week',
  yField: 'annual_rolling_fees_total',
  seriesField: 'cohort',
  labelField: 'symbol',
  enableFiltering: true,
  globalFilterField: 'symbol',
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt',                 format: 'formatNumber',   label: '#' },
    fees:  { field: 'annual_rolling_fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT week, symbol, cohort, annual_rolling_fees_total, users_cnt
    FROM dbt.api_revenue_holdings_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
