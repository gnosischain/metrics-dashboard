const metric = {
  id: 'api_dao_treasury_allocation_latest',
  name: 'Current Allocation',
  description: 'Treasury breakdown by token (USD)',
  metricDescription: 'Current GnosisDAO holdings breakdown on Gnosis Chain by token. Shows each asset individually — GNO, each stablecoin, ETH, RWA tokens, etc. Combines wallet holdings and lending positions.',
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value_usd',
  format: 'formatCurrency',
  useAbbreviatedLabels: true,
  pieLabelValue: false,
  query: `SELECT token, value_usd, percentage FROM dbt.api_dao_treasury_allocation_latest`,
};
export default metric;
