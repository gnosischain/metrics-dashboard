const metric = {
  id: 'api_execution_gnosis_app_kpi_token_offer_volume_7d',
  name: 'Token Offer Volume',
  description: 'Last 7 days',
  metricDescription: `Total USD value received by Gnosis App users through token-offer claims in the last 7 full days (rolling window ending yesterday), versus the prior 7 days. Volume is priced on the **received side only** — received token amount times that token's daily USD price (e.g. GNO amount times GNO price); the CRC spent to claim is **not** included because CRC has no reliable USD feed yet. Sums \`volume_received_usd\` from \`fct_execution_gnosis_app_token_offer_claims_daily\`; a claim whose received token has no price that day contributes 0.`,
  chartType: 'numberDisplay',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_token_offer_volume_7d`,
};
export default metric;
