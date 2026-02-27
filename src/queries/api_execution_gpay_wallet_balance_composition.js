const metric = {
  id: 'api_execution_gpay_wallet_balance_composition',
  name: 'Balance Composition',
  description: 'Latest breakdown by token',
  metricDescription: 'Current balance distribution across all tokens in Gnosis Pay wallets. Tokens below 1% of total are grouped into "Other".',
  chartType: 'pie',
  nameField: 'name',
  valueField: 'value',
  format: 'formatCurrency',
  showPercentage: true,
  query: `
    SELECT name, value
    FROM dbt.api_execution_gpay_wallet_balance_composition
  `,
};
export default metric;
