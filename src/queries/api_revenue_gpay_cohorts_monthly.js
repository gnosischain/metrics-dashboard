const metric = {
  id: 'api_revenue_gpay_cohorts_monthly',
  name: 'Gnosis Pay Revenue — Monthly Cohorts',
  description: 'Per-month Gnosis Pay fee revenue, bucketed by per-user monthly revenue.',
  metricDescription:
    'Each ERC-20 transfer to the Gnosis Pay settlement address (`0x4822…172EE`) is a payment. Per-payment fees priced to USD at the transfer date:\n\n' +
    '- **EURe** — 20 bps (0.20%)\n' +
    '- **GBPe** — 20 bps (0.20%)\n' +
    '- **USDC.e** — 100 bps (1.00%)\n\n' +
    'Old EURe/GBPe contracts retire on 2024-08-25 — both contract addresses are covered via the tokens-whitelist date range.\n\n' +
    'Fees are summed over one **calendar month** (no rolling). Buckets are scaled down from the yearly view — a user at ~$0.50 this month sits at roughly the $6/year bucket in the weekly view (6 ÷ 12 ≈ 0.5). This view highlights **who was actively paying this month**, whereas the weekly view describes the ongoing rolling distribution.',
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
    FROM dbt.api_revenue_gpay_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
