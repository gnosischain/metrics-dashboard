const metric = {
  id: 'api_execution_gnosis_app_kpi_token_offer_volume_7d',
  name: 'Token Offer Volume',
  description: 'Last 7 days',
  metricDescription: 'Token-offer received-side USD volume (e.g. GNO × GNO price) in the last 7 full days. CRC spent is not USD-priced (CRC price feed TBD).',
  chartType: 'numberDisplay',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_token_offer_volume_7d`,
};
export default metric;
