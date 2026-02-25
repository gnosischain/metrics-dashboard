const metric = {
  id: 'api_execution_gpay_cashback_recipients_total',
  name: 'Recipients',
  description: 'All-time',
  metricDescription: 'Unique wallets receiving cashback',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  format: 'formatNumber',
  query: `SELECT value FROM dbt.api_execution_gpay_cashback_recipients_total`,
};
export default metric;
