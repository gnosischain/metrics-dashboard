const metric = {
  id: 'api_execution_gpay_cashback_cumulative',
  name: 'Cumulative Cashback',
  description: 'Running total of cashback distributed',
  chartType: 'area',
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
    FROM dbt.api_execution_gpay_cashback_cumulative
  `,
};
export default metric;
