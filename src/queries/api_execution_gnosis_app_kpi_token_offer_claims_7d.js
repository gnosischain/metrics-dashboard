const metric = {
  id: 'api_execution_gnosis_app_kpi_token_offer_claims_7d',
  name: 'Token Offer Claims',
  description: 'Last 7 days',
  metricDescription: 'OfferClaimed events on ERC20TokenOfferCycle contracts by Gnosis App users, relayed via the Cometh bundler to the ERC-4337 EntryPoint, in the last 7 full days.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_token_offer_claims_7d`,
};
export default metric;
