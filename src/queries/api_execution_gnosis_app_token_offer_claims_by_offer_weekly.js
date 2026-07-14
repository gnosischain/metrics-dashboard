const metric = {
  id: 'api_execution_gnosis_app_token_offer_claims_by_offer_weekly',
  name: 'Claims by Offer',
  description: 'Weekly — claims stacked by offer instance',
  metricDescription: `Weekly count of Gnosis App token-offer claims, stacked by offer instance (\`offer_address\` prefix plus \`offer_token_symbol\`). A claim is an \`OfferClaimed\` event on a Circles v2 \`ERC20TokenOfferCycle\` contract where the claimer is a known Gnosis App user and the transaction was routed through the Cometh ERC-4337 bundler — i.e. the user spent CRC to receive the offered token. \`n_claims\` counts individual claim events (not distinct claimers); weeks start Monday and coverage begins 2025-11-12.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_claims',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  query: `
    SELECT toStartOfWeek(date, 1) AS date,
           concat(substring(offer_address, 1, 10), '…',
                  coalesce(concat(' ', offer_token_symbol), '')) AS label,
           sum(n_claims) AS n_claims
    FROM dbt.api_execution_gnosis_app_token_offer_claims_by_offer_daily
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
