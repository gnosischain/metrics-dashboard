const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_migrated_cards",
  "name": "Migrated cards",
  "description": "Old Safes migrated (Jun 2026)",
  metricDescription: `Total number of Gnosis Pay cards (Safe smart wallets) migrated to a new Safe in the June 2026 post-exploit migration — one row per old Safe in \`int_execution_gpay_safe_canonical\`, mapped 1:1 to its new \`canonical_address\` (source: \`gp_migrated_safes\` seed; exact-duplicate rows deduped, no chained migrations). Counts every migrated card regardless of whether it was ever funded or reactivated. Unit: count of cards.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(count(*)) AS value FROM dbt.int_execution_gpay_safe_canonical"
};
export default metric;
