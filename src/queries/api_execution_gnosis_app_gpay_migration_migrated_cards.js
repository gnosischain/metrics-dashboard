const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_migrated_cards",
  "name": "Migrated cards",
  "description": "Old Safes migrated (Jun 2026)",
  "metricDescription": "Gnosis Pay cards (Safes) migrated to a new Safe after the June-2026 exploit (int_execution_gpay_safe_canonical, 1:1 old->new).",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(count(*)) AS value FROM dbt.int_execution_gpay_safe_canonical"
};
export default metric;
