const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_funded_cards",
  "name": "Ever-funded cards",
  "description": "Held funds at some point (real base)",
  "metricDescription": "Migrated cards whose old OR new Safe ever held a positive USD balance. The rest are empty shells never used \u2014 so this is the honest denominator for adoption, not the 66k total.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf((lower(address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0) OR lower(canonical_address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0)))) AS value FROM dbt.int_execution_gpay_safe_canonical"
};
export default metric;
