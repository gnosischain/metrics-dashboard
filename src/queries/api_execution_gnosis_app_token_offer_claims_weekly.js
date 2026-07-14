const metric = {
  id: 'api_execution_gnosis_app_token_offer_claims_weekly',
  name: 'Token Offer Claims',
  description: 'Claims, claimers and USD volume — daily or weekly',
  metricDescription: `**Token-offer claims.** A claim is an \`OfferClaimed\` event where a Gnosis App user spends CRC to buy an offered token (e.g. GNO) from an \`ERC20TokenOfferCycle\` contract; counted only when the claim was relayed by a Cometh bundler and the claimer is a known Gnosis App user, from 2025-11-12. Use the **D / W** control to switch grain and the value toggle for **Claims** (all events), **Claimers** (distinct claimers) or **Volume (USD)** (received-token amount priced in USD — the CRC spent has no USD feed). The current incomplete day/week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_claims',
  format: 'formatNumber',
  resolutions: ['daily', 'weekly'],
  defaultResolution: 'weekly',
  valueModeOptions: [
    { key: 'n_claims',   label: 'Claims',       valueField: 'n_claims',   format: 'formatNumber' },
    { key: 'n_claimers', label: 'Claimers',     valueField: 'n_claimers', format: 'formatNumber' },
    { key: 'volume_usd', label: 'Volume (USD)', valueField: 'volume_usd', format: 'formatCurrency' },
  ],
  defaultValueMode: 'n_claims',
  query: `
    SELECT toDate(week) AS date, n_claims, n_claimers, volume_received_usd AS volume_usd
    FROM dbt.api_execution_gnosis_app_token_offer_claims_weekly
    ORDER BY date ASC
  `,
};
export default metric;
