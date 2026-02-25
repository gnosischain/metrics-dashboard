const metric = {
  id: 'api_execution_gpay_gno_total_balance',
  name: 'GNO Balance',
  description: 'Total GNO held in GPay wallets',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_gno_total_balance`,
};
export default metric;
