const metric = {
  id: 'api_execution_gpay_cashback_weekly',
  name: 'Weekly Cashback',
  description: 'Cashback distributed per week',
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
