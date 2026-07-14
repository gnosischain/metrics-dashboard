const metric = {
  id: 'api_execution_gnosis_app_marketplace_offers_leaderboard',
  name: 'Marketplace Offers Leaderboard',
  description: 'Lifetime totals per curated offer',
  metricDescription: `Lifetime totals per curated Circles marketplace **offer**. \`total_buys\` counts payment events (rows) and \`total_payers\` counts distinct paying addresses; \`first_buy\`/\`last_buy\` bound the offer's activity window. A **buy** is a \`PaymentReceived\` event on the Circles v2 \`PaymentGatewayFactory\` where the payer is a known Gnosis App user and the transaction was relayed by an active Cometh ERC-4337 bundler; only curated offers are listed (created via \`createGateway\` with a non-empty name, excluding those blacklisted in \`gnosis_app_marketplace_offers_excluded\`), and offers with no buys appear with zeros. There is no volume column here. Since 2025-11-12.`,
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
