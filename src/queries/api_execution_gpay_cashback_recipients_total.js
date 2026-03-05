const metric = {
  id: 'api_execution_gpay_cashback_recipients_total',
  name: 'Recipients',
  description: 'All-time',
  metricDescription: 'Total unique wallets that have received at least one GNO cashback reward from Gnosis Pay.',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  format: 'formatNumber',
  query: `SELECT value FROM dbt.api_execution_gpay_cashback_recipients_total`,
};
export default metric;
