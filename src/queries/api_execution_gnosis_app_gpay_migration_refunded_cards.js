const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_refunded_cards",
  "name": "Refunded cards",
  "description": "Exploited old Safes made whole",
  "metricDescription": `Count of migrated Safe pairs flagged \`is_lost = 1\` in \`int_execution_gpay_safe_switchover\` \u2014 old Safes whose funds were lost in the June 2026 exploit and made whole by an exploit-recovery refund sent to the paired **new** Safe from a verified distributor wallet. One row per migrated old\u2192new pair; refunds landed a few days after migration (2026-06-05..09). Count.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_lost = 1)) AS value FROM dbt.int_execution_gpay_safe_switchover"
};
export default metric;
