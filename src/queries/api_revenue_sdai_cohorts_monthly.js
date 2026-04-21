const metric = {
  id: 'api_revenue_sdai_cohorts_monthly',
  name: 'sDAI Revenue — Monthly Cohorts',
  description: 'Per-month DAO share of sDAI yield, bucketed by per-user monthly revenue.',
  metricDescription:
    'Per day we compute `balance_usd × sdai_daily_rate × 10%`. The daily rate comes from on-chain sDAI share-price conversion; **10%** is the DAO\'s assumed share of the full rate. Balances across sDAI, aGnosDAI and spsDAI are combined.\n\n' +
    'Fees are summed over one **calendar month** (no rolling). Buckets are scaled down from the yearly view — a user at ~$0.50 this month sits at roughly the $6/year bucket in the weekly view (6 ÷ 12 ≈ 0.5). This view highlights **who was actively earning this month**, whereas the weekly view describes the ongoing rolling distribution.',
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
    FROM dbt.api_revenue_sdai_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
