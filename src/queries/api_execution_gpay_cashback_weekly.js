const metric = {
  id: 'api_execution_gpay_cashback_weekly',
  name: 'Cashback',
  description: 'Distributed per week',
  metricDescription: 'Weekly GNO cashback distributed to Gnosis Pay users. Toggle between native GNO and USD value to compare reward amounts or dollar cost over time.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  unitFilterField: 'unit',
  unitFields: {
    native: { field: 'value', format: 'formatNumber' },
    usd: { field: 'value', format: 'formatCurrency' },
  },
  query: `
    SELECT unit, date, value
    FROM dbt.api_execution_gpay_cashback_weekly
  `,
};
export default metric;
