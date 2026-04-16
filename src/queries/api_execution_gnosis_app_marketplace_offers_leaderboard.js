const metric = {
  id: 'api_execution_gnosis_app_marketplace_offers_leaderboard',
  name: 'Offers Leaderboard',
  description: 'Lifetime totals per curated offer',
  chartType: 'table',
  query: `
    SELECT
      offer_name,
      total_buys,
      total_payers,
      toDate(first_buy_at)  AS first_buy,
      toDate(last_buy_at)   AS last_buy
    FROM dbt.api_execution_gnosis_app_marketplace_offers_latest
    ORDER BY total_buys DESC
  `,
};
export default metric;
