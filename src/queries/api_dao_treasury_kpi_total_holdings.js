const metric = {
  id: 'api_dao_treasury_kpi_total_holdings',
  name: 'Total Holdings',
  description: 'Gnosis Chain only',
  metricDescription: 'Total USD value of GnosisDAO holdings on Gnosis Chain, including wallet token balances and lending positions (Aave V3 & SparkLend).',
  chartType: 'numberDisplay',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_dao_treasury_kpi_total_holdings`,
};
export default metric;
