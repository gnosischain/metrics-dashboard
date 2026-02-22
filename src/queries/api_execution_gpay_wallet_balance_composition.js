const metric = {
  id: 'api_execution_gpay_wallet_balance_composition',
  name: 'Wallet Balance Composition',
  description: 'Latest balance breakdown — all tokens',
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
