const metric = {
  id: 'api_revenue_holdings_cohorts_monthly',
  name: 'Holdings Revenue — Monthly Cohorts',
  description: 'Per-month imputed interest from EURe / USDC.e / BRLA / ZCHF balances, bucketed by per-user monthly revenue.',
  metricDescription:
    'Per user per day we compute an imputed daily fee as **balance_usd × daily_rate**. Daily rates expressed per-day:\n\n' +
    '- **EURe** — 0.351% APY\n' +
    '- **USDC.e** — 0.351% APY\n' +
    '- **BRLA** — 2.07% APY\n' +
    '- **ZCHF** — 0.5% APY\n\n' +
    'Fees are summed over one **calendar month** (no rolling). Buckets are scaled down from the yearly view — a user at ~$0.50 this month sits at roughly the $6/year bucket in the weekly view (6 ÷ 12 ≈ 0.5). This view highlights **who was actively paying this month**, whereas the weekly view describes the ongoing rolling distribution. The two are complementary.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'month',
  yField: 'fees_total',
  seriesField: 'cohort',
  labelField: 'symbol',
  enableFiltering: true,
  globalFilterField: 'symbol',
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt',  format: 'formatNumber',   label: '#' },
    fees:  { field: 'fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT month, symbol, cohort, fees_total, users_cnt
    FROM dbt.api_revenue_holdings_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
