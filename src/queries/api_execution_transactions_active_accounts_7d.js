const metric = {
  id: 'api_execution_transactions_active_accounts_7d',
  name: 'Initiator Accounts',
  description: 'Last 7 days',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT * FROM dbt.api_execution_transactions_active_accounts_7d`,
};
export default metric;