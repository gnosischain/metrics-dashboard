const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_refunded_cards",
  "name": "Refunded cards",
  "description": "Exploited old Safes made whole",
  "metricDescription": "Migrated pairs flagged is_lost=1 in int_execution_gpay_safe_switchover \u2014 old Safes drained in the exploit and refunded by Gnosis to the new Safe (refunds landed 2026-06-05..09).",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_lost = 1)) AS value FROM dbt.int_execution_gpay_safe_switchover"
};
export default metric;
