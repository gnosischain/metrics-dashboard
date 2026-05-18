const metric = {
  id: 'api_dao_treasury_kpi_gno_held',
  name: 'GNO Held',
  description: 'Gnosis Chain only',
  metricDescription: 'Total GNO and GNO derivatives (sGNO, spGNO, aGnoGNO) held by GnosisDAO wallets on Gnosis Chain, expressed in GNO units.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_dao_treasury_kpi_gno_held`,
};
export default metric;
