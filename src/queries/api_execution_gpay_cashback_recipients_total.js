const metric = {
  id: 'api_execution_gpay_cashback_recipients_total',
  name: 'Recipients',
  description: 'Unique wallets receiving cashback - All-time',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  format: 'formatNumber',
  query: `SELECT value FROM dbt.api_execution_gpay_cashback_recipients_total`,
};
export default metric;
