const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_usd_in_new_safes",
  "name": "Value in new Safes",
  "description": "USD now held in migrated new Safes",
  "metricDescription": "Latest USD held across migrated NEW (canonical) Safes. NOTE: do not add to 'stranded in old' \u2014 refunded pairs can hold value in both at once.",
  "chartType": "numberDisplay",
  "format": "formatCurrencyCompact",
  "valueField": "value",
  "query": "SELECT round(sumIf(b.balance_usd, b.address IN (SELECT canonical_address FROM dbt.int_execution_gpay_safe_canonical)), 2) AS value FROM dbt.int_execution_gpay_balances_daily b WHERE b.date = (SELECT max(date) FROM dbt.int_execution_gpay_balances_daily)"
};
export default metric;
