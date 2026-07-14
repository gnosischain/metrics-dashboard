const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivated_spend",
  "name": "Reactivated (card spend)",
  "description": "Made a card payment since migration",
  metricDescription: `Distinct migrated cards whose **new** canonical Safe made at least one card payment (\`action = 'Payment'\` in \`int_execution_gpay_activity\` \u2014 a token transfer from the Safe to the Gnosis Pay merchant settlement address) on or after the 2026-06-04 cutover. This is the strict "actually using the card again" measure; deposits, cashback, top-ups and withdrawals do not count. Counts new Safes via \`uniqExact(canonical_address)\`. Unit: count of cards.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(uniqExact(c.canonical_address)) AS value FROM dbt.int_execution_gpay_safe_canonical c INNER JOIN dbt.int_execution_gpay_activity a ON lower(a.wallet_address) = c.canonical_address WHERE a.date >= '2026-06-04' AND a.action = 'Payment'"
};
export default metric;
