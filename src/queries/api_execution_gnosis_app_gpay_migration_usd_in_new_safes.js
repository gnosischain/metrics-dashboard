const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_usd_in_new_safes",
  "name": "Value in new Safes",
  "description": "USD now held in migrated new Safes",
  "metricDescription": `**USD held in migrated NEW (canonical) Safes.** Sums the latest daily balance (\`balance_usd\`, across all tokens) of every NEW Safe that a Gnosis Pay Safe was migrated into during the June 2026 post-exploit migration (the \`canonical_address\` targets in \`int_execution_gpay_safe_canonical\`). Balances come from \`int_execution_gpay_balances_daily\` at its most recent completed date (\`today()\` is excluded). Do NOT add this to **Stranded in old Safes**: for refunded (exploited) pairs the same value can be counted in both the old and new Safe at once.`,
  "chartType": "numberDisplay",
  "format": "formatCurrencyCompact",
  "valueField": "value",
  "query": "SELECT round(sumIf(b.balance_usd, b.address IN (SELECT canonical_address FROM dbt.int_execution_gpay_safe_canonical)), 2) AS value FROM dbt.int_execution_gpay_balances_daily b WHERE b.date = (SELECT max(date) FROM dbt.int_execution_gpay_balances_daily)"
};
export default metric;
