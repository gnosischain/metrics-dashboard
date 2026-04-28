const metric = {
  id: 'api_dao_treasury_kpi_lending_total',
  name: 'Lending Positions',
  description: 'Aave V3 & SparkLend',
  metricDescription: 'Total USD value of GnosisDAO lending supply positions on Gnosis Chain across Aave V3 and SparkLend protocols.',
  chartType: 'numberDisplay',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_dao_treasury_kpi_lending_total`,
};
export default metric;
