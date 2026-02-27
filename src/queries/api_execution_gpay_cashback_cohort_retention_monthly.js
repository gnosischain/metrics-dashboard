const metric = {
  id: 'api_execution_gpay_cashback_cohort_retention_monthly',
  name: 'Cashback Cohort Retention',
  description: 'Payment retention after first cashback',
  metricDescription: 'Cohort heatmap where cohorts are defined by first cashback month.',
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
