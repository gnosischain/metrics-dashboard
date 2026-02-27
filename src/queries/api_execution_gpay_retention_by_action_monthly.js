const metric = {
  id: 'api_execution_gpay_retention_by_action_monthly',
  name: 'Retention by Action',
  description: 'Cohort heatmap by first action month',
  metricDescription: 'Cohort retention heatmap by action type. Filter action and switch between users/volume views.',
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'retention_pct',
  format: 'formatPercentageInt',
  showLabels: true,
  enableZoom: true,
  visualMapOrient: 'vertical',
  grid: { right: '12%', bottom: '8%' },
  enableFiltering: true,
  labelField: 'action',
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
    SELECT action, x, y, retention_pct, value_abs, amount_retention_pct, value_usd
    FROM dbt.api_execution_gpay_retention_by_action_monthly
    ORDER BY
      if(action = 'Payment', 0, 1),
      y ASC,
      x ASC
  `,
};

export default metric;
