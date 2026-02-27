const metric = {
  id: 'api_execution_gpay_gno_total_balance',
  name: 'GNO Balance',
  description: 'Across all wallets',
  metricDescription: 'Total GNO held across all Gnosis Pay wallets at the latest date.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_gno_total_balance`,
};
export default metric;
