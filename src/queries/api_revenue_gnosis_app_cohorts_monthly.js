const metric = {
  id: 'api_revenue_gnosis_app_cohorts_monthly',
  name: 'Gnosis App Revenue — Monthly Cohorts',
  description: 'Per-month Metri CRC fees attributable to the DAO, bucketed by per-user monthly revenue.',
  metricDescription:
    'When a user transacts via Gnosis App (Cometh ERC-4337), a CRC ERC-1155 fee is paid to the Metri fee receiver address. ' +
    'Each fee transfer is priced using the per-avatar CRC token price from on-chain DEX data; tokens without a DEX price fall back to the daily median CRC price across all tokens.\n\n' +
    'Fees are summed over one **calendar month** (no rolling). Buckets are scaled down from the yearly view — a user at ~$0.50 this month sits at roughly the $6/year bucket in the weekly view (6 ÷ 12 ≈ 0.5). ' +
    'This view highlights **who was actively paying fees this month**, whereas the weekly view describes the ongoing rolling distribution.',
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
    FROM dbt.api_revenue_gnosis_app_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
