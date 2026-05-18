const metric = {
  id: 'api_revenue_sdai_cohorts_weekly',
  name: 'sDAI Revenue — Rolling 52w Cohorts',
  description: 'Trailing-year DAO share of sDAI yield, bucketed by per-user annual revenue.',
  metricDescription:
    'Per day we compute `balance_usd × sdai_daily_rate × 10%`. The daily rate comes from on-chain sDAI share-price conversion; **10%** is the DAO\'s assumed share of the full rate. ' +
    'Balances across sDAI, aGnosDAI and spsDAI are combined.\n\n' +
    'Daily fees are summed per user to the week, then trailing 52 weeks are summed for each user-week. Users are bucketed by their annualised total ($1–3, $3–6, $6–10, $10–100, ≥$100). ' +
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
    FROM dbt.api_revenue_sdai_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
