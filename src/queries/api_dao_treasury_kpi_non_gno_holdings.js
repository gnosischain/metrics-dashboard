const metric = {
  id: 'api_dao_treasury_kpi_non_gno_holdings',
  name: 'Non-GNO Holdings',
  description: 'Gnosis Chain only',
  metricDescription: 'Total USD value of GnosisDAO non-GNO assets on Gnosis Chain. Excludes GNO and GNO derivatives (sGNO, spGNO, aGnoGNO). This is the numerator for the on-chain NAV per GNO calculation.',
  chartType: 'numberDisplay',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_dao_treasury_kpi_non_gno_holdings`,
};
export default metric;
