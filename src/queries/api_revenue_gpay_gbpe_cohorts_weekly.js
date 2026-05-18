const metric = {
  id: 'api_revenue_gpay_gbpe_cohorts_weekly',
  name: 'Gnosis Pay GBPe — Rolling 52w Cohorts',
  description: 'Trailing-year Gnosis Pay GBPe fee revenue.',
  metricDescription:
    'GBPe transfers to the GP settlement address (`0x4822…172EE`) × **20 bps (0.20%)**, priced to USD. Old GBPe contract retires 2024-08-25. Daily fees summed to weekly, then trailing 52 calendar weeks (dense).',
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
    FROM dbt.api_revenue_gpay_gbpe_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
