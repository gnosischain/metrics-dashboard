const metric = {
  id: 'api_revenue_gpay_cohorts_weekly',
  name: 'Gnosis Pay Revenue — Rolling 52w Cohorts',
  description: 'Trailing-year Gnosis Pay fee revenue, bucketed by per-user annual revenue.',
  metricDescription:
    'Each ERC-20 transfer to the Gnosis Pay settlement address (`0x4822…172EE`) is treated as a payment. Per-payment fees are priced to USD at the transfer date:\n\n' +
    '- **EURe** — 20 bps (0.20%)\n' +
    '- **GBPe** — 20 bps (0.20%)\n' +
    '- **USDC.e** — 100 bps (1.00%)\n\n' +
    'Old EURe/GBPe contracts retire on 2024-08-25 — both contract addresses are covered via the tokens-whitelist date range.\n\n' +
    'Daily fees are summed per user to the week, then trailing 52 weeks are summed for each user-week. Users are bucketed by their annualised total ($1–3, $3–6, $6–10, $10–100, ≥$100). ' +
    'This view is distinct from the monthly view — not an aggregate of it.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'week',
  yField: 'annual_rolling_fees_total',
  seriesField: 'cohort',
  labelField: 'symbol',
  enableFiltering: true,
  globalFilterField: 'symbol',
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt',                 format: 'formatNumber',   label: '#' },
    fees:  { field: 'annual_rolling_fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT week, symbol, cohort, annual_rolling_fees_total, users_cnt
    FROM dbt.api_revenue_gpay_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
