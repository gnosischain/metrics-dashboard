const metric = {
  id: 'api_revenue_gnosis_app_cohorts_weekly',
  name: 'Gnosis App Revenue — Rolling 52w Cohorts',
  description: 'Trailing-year Metri CRC fees attributable to the DAO, bucketed by per-user annual revenue.',
  metricDescription:
    'When a user transacts via Gnosis App (Cometh ERC-4337), a CRC ERC-1155 fee is paid to the Metri fee receiver address. ' +
    'Each fee transfer is priced using the per-avatar CRC token price from on-chain DEX data; tokens without a DEX price fall back to the daily median CRC price across all tokens.\n\n' +
    'Daily fees are summed per user to the week, then trailing 52 weeks are summed for each user-week. Users are bucketed by their annualised total ($1–3, $3–6, $6–10, $10–100, ≥$100). ' +
    'This view is distinct from the monthly view — not an aggregate of it.',
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
    FROM dbt.api_revenue_gnosis_app_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
