const metric = {
  id: 'api_execution_gnosis_app_token_offer_offers_leaderboard',
  name: 'Token Offer Leaderboard',
  description: 'Lifetime totals per offer instance',
  metricDescription: `**Lifetime totals per token-offer instance.** Each row aggregates all daily claim records for one offer — an \`ERC20TokenOfferCycle\` where Gnosis App users spend CRC to buy the offered token (e.g. GNO) — counting only Cometh-relayed claims by known Gnosis App users since 2025-11-12. \`total_claims\` sums every \`OfferClaimed\` event; the claimers column sums each day's distinct claimers, so a claimer active on several days is counted once per day rather than as a lifetime-unique count. \`total_received_usd\` prices the received token in USD (the CRC spent has no USD feed) and \`total_spent_crc\` is CRC paid in 18-decimal v2 units.`,
  chartType: 'table',
  query: `
    SELECT
      offer_address,
      offer_token_symbol,
      sum(n_claims)                    AS total_claims,
      sum(n_claimers)                  AS total_claimers_daily_sum,
      round(sum(volume_received_token), 6) AS total_received_token,
      round(sum(volume_received_usd), 2)   AS total_received_usd,
      round(sum(volume_spent_crc), 2)      AS total_spent_crc,
      any(offer_price_in_crc)          AS offer_price_in_crc,
      min(date)                        AS first_claim,
      max(date)                        AS last_claim
    FROM dbt.api_execution_gnosis_app_token_offer_claims_by_offer_daily
    GROUP BY offer_address, offer_token_symbol
    ORDER BY total_claims DESC
  `,
};
export default metric;
