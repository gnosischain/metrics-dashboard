const metric = {
  id: 'api_execution_gnosis_app_token_offer_offers_leaderboard',
  name: 'Offers Leaderboard',
  description: 'Lifetime totals per offer instance',
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
