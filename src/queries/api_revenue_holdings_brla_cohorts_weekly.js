const metric = {
  id: 'api_revenue_holdings_brla_cohorts_weekly',
  name: 'BRLA Holdings — Rolling 52w Cohorts',
  description: 'Trailing-year imputed interest from BRLA balances.',
  metricDescription:
    'Per user per day we compute **balance_usd × 5.61349e-5** (2.07% APY expressed per-day). Daily fees summed to weekly, then trailing 52 calendar weeks (dense). Potential DAO-accruable fees.',
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
    FROM dbt.api_revenue_holdings_brla_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
