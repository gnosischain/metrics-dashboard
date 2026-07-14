const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_card_spend_weekly_usd",
  "name": "Card spend on migrated cards",
  "description": "Weekly card-payment USD",
  "metricDescription": `Weekly USD value of card payments made from **migrated (new) Safes** after the June 2026 post-exploit Gnosis Pay Safe migration. A **card payment** is an \`action = 'Payment'\` row in \`int_execution_gpay_activity\` \u2014 a Gnosis Pay wallet sending a whitelisted token (e.g. EURe, GBPe, USDC.e) to the Gnosis Pay merchant (card-settlement) address \u2014 valued at the token's daily USD price (missing price counts as 0). Only wallets that are a \`canonical_address\` (the new Safe an old Safe migrated to, per \`int_execution_gpay_safe_canonical\`) are included, and only activity from \`2026-06-01\` onward; weeks are Monday-aligned. Tracks how much real card spend has moved onto the post-migration Safes, summed per week in USD.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatCurrency",
  "query": "SELECT toString(toStartOfWeek(a.date, 1)) AS date, 'Card spend (USD)' AS label, toInt64(round(sum(a.amount_usd))) AS value FROM dbt.int_execution_gpay_activity a INNER JOIN (SELECT lower(canonical_address) AS n FROM dbt.int_execution_gpay_safe_canonical) c ON lower(a.wallet_address) = c.n WHERE a.action = 'Payment' AND a.date >= '2026-06-01' GROUP BY date ORDER BY date"
};
export default metric;
