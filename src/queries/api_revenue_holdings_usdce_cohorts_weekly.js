const metric = {
  id: 'api_revenue_holdings_usdce_cohorts_weekly',
  name: 'USDC.e Holdings — Rolling 52w Cohorts',
  description: 'Trailing-year imputed interest from USDC.e balances, bucketed by per-user annual revenue.',
  metricDescription:
    'Per user per day we compute **balance_usd × 9.6e-6** (0.351% APY expressed per-day). Daily fees summed to weekly, then trailing 52 **calendar** weeks per user (dense — gaps count as $0). Users bucketed by annualised total. Wrapped variants (aGnoUSDCe, spUSDC.e) fold into USDC.e. Potential DAO-accruable fees.',
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
    FROM dbt.api_revenue_holdings_usdce_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
