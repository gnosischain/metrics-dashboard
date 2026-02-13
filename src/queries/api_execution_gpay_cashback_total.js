const metric = {
  id: 'api_execution_gpay_cashback_total',
  name: 'Total Cashback',
  description: 'All-time cashback distributed',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  unitFilterField: 'unit',
  unitFields: {
    native: { field: 'value', format: 'formatNumber' },
    usd: { field: 'value', format: 'formatNumberWithUSD' },
  },
  query: `SELECT unit, value FROM dbt.api_execution_gpay_cashback_total`,
};
export default metric;
