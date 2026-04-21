const metric = {
  id: 'api_revenue_gpay_eure_cohorts_weekly',
  name: 'Gnosis Pay EURe — Rolling 52w Cohorts',
  description: 'Trailing-year Gnosis Pay EURe fee revenue, bucketed by per-user annual revenue.',
  metricDescription:
    'Each ERC-20 EURe transfer to the Gnosis Pay settlement address (`0x4822…172EE`) is a payment. Fee = **20 bps (0.20%)** of the transfer amount, priced to USD at the transfer date. Old EURe contract retires 2024-08-25; both addresses are covered via the tokens-whitelist date range. Daily fees summed to weekly, then trailing 52 calendar weeks (dense).',
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
    FROM dbt.api_revenue_gpay_eure_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
