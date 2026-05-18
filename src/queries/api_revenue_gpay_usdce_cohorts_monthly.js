const metric = {
  id: 'api_revenue_gpay_usdce_cohorts_monthly',
  name: 'Gnosis Pay USDC.e — Monthly Cohorts',
  description: 'Per-month Gnosis Pay USDC.e fee revenue.',
  metricDescription:
    'USDC.e transfers to the GP settlement address × **100 bps**, priced to USD. Fees summed per calendar month.',
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
    FROM dbt.api_revenue_gpay_usdce_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
