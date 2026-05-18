const metric = {
  id: 'api_revenue_holdings_brla_cohorts_monthly',
  name: 'BRLA Holdings — Monthly Cohorts',
  description: 'Per-month imputed interest from BRLA balances.',
  metricDescription:
    'Per user per day we compute **balance_usd × 5.61349e-5** (2.07% APY). Fees summed over one calendar month; buckets scaled down from the yearly view.',
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
    FROM dbt.api_revenue_holdings_brla_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
