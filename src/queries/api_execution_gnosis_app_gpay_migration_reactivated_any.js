const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivated_any",
  "name": "Reactivated cards",
  "description": "Any activity on new Safe since migration",
  "metricDescription": "Migrated cards whose NEW Safe has had ANY activity (deposit / spend / withdrawal) since the migration cutover 2026-06-04. ~64% of ever-funded cards.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(uniqExact(c.canonical_address)) AS value FROM dbt.int_execution_gpay_safe_canonical c INNER JOIN dbt.int_execution_gpay_activity a ON lower(a.wallet_address) = c.canonical_address WHERE a.date >= '2026-06-04'"
};
export default metric;
