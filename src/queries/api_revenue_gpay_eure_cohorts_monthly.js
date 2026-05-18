const metric = {
  id: 'api_revenue_gpay_eure_cohorts_monthly',
  name: 'Gnosis Pay EURe — Monthly Cohorts',
  description: 'Per-month Gnosis Pay EURe fee revenue.',
  metricDescription:
    'EURe transfers to the GP settlement address × **20 bps**, priced to USD. Fees summed per calendar month; buckets scaled from the yearly view.',
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
    FROM dbt.api_revenue_gpay_eure_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
