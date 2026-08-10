const metric = {
  id: 'api_celo_gpay_wallet_balance_composition',
  name: 'Balance Composition',
  description: 'Latest breakdown by token',
  metricDescription: 'Current balance distribution across settlement tokens (USDC, USDT) in Gnosis Pay card Safes on Celo. Tokens below 1% of total are grouped into "Other".',
  chartType: 'pie',
  nameField: 'name',
  valueField: 'value',
  format: 'formatCurrency',
  showPercentage: true,
  query: `
    SELECT name, value
    FROM dbt.api_celo_gpay_wallet_balance_composition
  `,
};
export default metric;
