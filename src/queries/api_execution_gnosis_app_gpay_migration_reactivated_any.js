const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivated_any",
  "name": "Reactivated cards",
  "description": "Any activity on new Safe since migration",
  metricDescription: `Distinct migrated cards whose **new** canonical Safe recorded any classified activity in \`int_execution_gpay_activity\` on or after the 2026-06-04 migration cutover — a card payment, reversal, cashback, fiat top-up/off-ramp, or crypto deposit/withdrawal (any whitelisted-token transfer counts). Counts new Safes via \`uniqExact(canonical_address)\` from \`int_execution_gpay_safe_canonical\`; this is the loose "card came back to life" measure. Unit: count of cards.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(uniqExact(c.canonical_address)) AS value FROM dbt.int_execution_gpay_safe_canonical c INNER JOIN dbt.int_execution_gpay_activity a ON lower(a.wallet_address) = c.canonical_address WHERE a.date >= '2026-06-04'"
};
export default metric;
