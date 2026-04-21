const metric = {
  id: 'api_revenue_holdings_eure_cohorts_monthly',
  name: 'EURe Holdings — Monthly Cohorts',
  description: 'Per-month imputed interest from EURe balances, bucketed by per-user monthly revenue.',
  metricDescription:
    'Per user per day we compute **balance_usd × 9.6e-6** (0.351% APY expressed per-day). Fees are summed over one **calendar month** (no rolling). Buckets are scaled down from the yearly view — a user at ~$0.50 this month sits at roughly the $6/year bucket in the weekly view (6 ÷ 12 ≈ 0.5). Wrapped variants (aGnoEURe, spEURe) are folded into EURe.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'month',
  yField: 'fees_total',
  seriesField: 'cohort',
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt',  format: 'formatNumber',   label: '#' },
    fees:  { field: 'fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT month, cohort, fees_total, users_cnt
    FROM dbt.api_revenue_holdings_eure_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
