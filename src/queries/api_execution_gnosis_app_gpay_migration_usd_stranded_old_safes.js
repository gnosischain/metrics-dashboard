const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_usd_stranded_old_safes",
  "name": "Stranded in old Safes",
  "description": "USD not yet moved to the new card",
  "metricDescription": "Latest USD still sitting in migrated OLD Safes (funds users have not moved to their new card). May overlap a landed refund for exploited pairs, so do NOT sum with 'Value in new Safes'.",
  "chartType": "numberDisplay",
  "format": "formatCurrencyCompact",
  "valueField": "value",
  "query": "SELECT round(sumIf(b.balance_usd, b.address IN (SELECT address FROM dbt.int_execution_gpay_safe_canonical)), 2) AS value FROM dbt.int_execution_gpay_balances_daily b WHERE b.date = (SELECT max(date) FROM dbt.int_execution_gpay_balances_daily)"
};
export default metric;
