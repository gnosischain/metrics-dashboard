const metric = {
  id: 'api_revenue_active_users_totals_weekly',
  name: 'Active Users — Rolling 52 Weeks',
  description: 'Unique cross-stream users with ≥ $6 of trailing-year revenue (holdings + sDAI + GPay, summed before counting).',
  metricDescription:
    'For each user, trailing-52-week fees are summed across **all** streams (holdings + sDAI + GPay) **before** thresholding, so a user is counted at most once per week. A user qualifies if their cross-stream rolling total is **≥ $6**. Horizontal reference lines mark 125K / 250K / 500K / 1M active-user milestones.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'week',
  yField: 'users_cnt',
  format: 'formatNumber',
  showTotal: false,
  unitFields: {
    users: { field: 'users_cnt',                 format: 'formatNumber',   label: '#' },
    fees:  { field: 'annual_rolling_fees_total', format: 'formatCurrency', label: '$' },
  },
  yAxis: {
    type: 'log',
    min: 1,
    max: 2000000,
  },
  markLine: {
    silent: false,
    symbol: 'none',
    label: {
      position: 'insideEndTop',
      formatter: (params) => params.name,
      color: '#888',
      fontSize: 11,
    },
    lineStyle: { type: 'dashed', width: 1 },
    data: [
      { name: '125K', yAxis: 125000, lineStyle: { color: '#cccccc' } },
      { name: '250K', yAxis: 250000, lineStyle: { color: '#f0ad4e' } },
      { name: '500K', yAxis: 500000, lineStyle: { color: '#a94442' } },
      { name: '1M',   yAxis: 1000000, lineStyle: { color: '#d9534f' } },
    ],
  },
  query: `
    SELECT week, users_cnt, annual_rolling_fees_total
    FROM dbt.api_revenue_active_users_totals_weekly
    ORDER BY week ASC
  `,
};
export default metric;
