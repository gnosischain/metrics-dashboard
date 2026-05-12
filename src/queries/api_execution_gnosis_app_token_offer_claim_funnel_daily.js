const metric = {
  id: 'api_execution_gnosis_app_token_offer_claim_funnel_daily',
  name: 'Claim Funnel',
  description: 'Daily claim rate vs eligible pool',
  metricDescription: 'Daily per-offer token-offer claim funnel: number of claimers, eligible pool (rolling 30-day active GA users as proxy), and claim_rate_pct. Use the offer dropdown to focus on a single offer.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'claim_rate_pct',
  seriesField: 'offer_address',
  query: `
    SELECT date, offer_address, n_claims, n_claimers, n_active_pool_30d, claim_rate_pct, amount_received_usd
    FROM dbt.api_execution_gnosis_app_token_offer_claim_funnel_daily
    ORDER BY date
  `,
};
export default metric;
