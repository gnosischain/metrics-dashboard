const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_funded_cards",
  "name": "Ever-funded cards",
  "description": "Held funds at some point (real base)",
  metricDescription: `Count of migrated Gnosis Pay cards (rows in \`int_execution_gpay_safe_canonical\`, one per old Safe migrated to a new canonical Safe after the June 2026 exploit) whose old **or** new Safe ever recorded a positive USD balance (\`balance_usd > 0\` on any day in \`int_execution_gpay_balances_daily\`). Cards that never held funds are excluded as empty shells, making this the real adoption denominator rather than the full migrated-card total. Unit: count of cards.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf((lower(address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0) OR lower(canonical_address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0)))) AS value FROM dbt.int_execution_gpay_safe_canonical"
};
export default metric;
