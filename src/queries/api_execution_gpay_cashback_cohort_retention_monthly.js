const metric = {
  id: 'api_execution_gpay_cashback_cohort_retention_monthly',
  name: 'Cashback Cohort Retention',
  description: 'Payment retention after first cashback',
  metricDescription: `Each row is a cohort of users grouped by the month they first received cashback. Each column is a calendar month. The heatmap tracks their subsequent payment activity.

- % — What percentage of the cohort made a payment that month.
- \\# — How many users from the cohort made a payment.
- $ — Total payment volume (USD) from that cohort.

Example: if the Jun 2024 row shows 45% in Oct 2024, it means 45% of users who first received cashback in Jun 2024 were still making payments in Oct 2024.`,
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'retention_pct',
  format: 'formatPercentageInt',
  showLabels: true,
  enableZoom: true,
  visualMapOrient: 'vertical',
  grid: { right: '12%', bottom: '8%' },
  unitFields: {
    'pct|users': { field: 'retention_pct', format: 'formatPercentageInt', label: '%' },
    'pct|amount': { field: 'amount_retention_pct', format: 'formatPercentageInt', label: '%', visualMapCenter: 100, visualMapPercentile: true },
    'val|users': { field: 'value_abs', format: 'formatNumber', label: '#', visualMapPercentile: true },
    'val|amount': { field: 'value_usd', format: 'formatCurrencyCompact', label: '$', visualMapPercentile: true },
  },
  unitFieldGroups: [
    { options: { pct: '%', val: 'val' } },
    { options: { users: '#', amount: '$' } },
  ],
  query: `
    SELECT x, y, retention_pct, value_abs, amount_retention_pct, value_usd
    FROM dbt.api_execution_gpay_cashback_cohort_retention_monthly
    ORDER BY y ASC, x ASC
  `,
};

export default metric;
