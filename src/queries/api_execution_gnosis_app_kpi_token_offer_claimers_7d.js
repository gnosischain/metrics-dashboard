const metric = {
  id: 'api_execution_gnosis_app_kpi_token_offer_claimers_7d',
  name: 'Token Offer Claimers',
  description: 'Last 7 days',
  metricDescription: 'Distinct Gnosis App users who claimed at least one token offer in the last 7 full days.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_token_offer_claimers_7d`,
};
export default metric;
