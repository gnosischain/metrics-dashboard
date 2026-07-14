const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_usd_stranded_old_safes",
  "name": "Stranded in old Safes",
  "description": "USD not yet moved to the new card",
  "metricDescription": `**USD still sitting in migrated OLD Safes** — funds a user has not yet moved to their new card. Sums the latest daily balance (\`balance_usd\`, across all tokens) of every OLD Safe in the June 2026 post-exploit migration (the \`address\` / old-Safe side of \`int_execution_gpay_safe_canonical\`), taken from \`int_execution_gpay_balances_daily\` at its most recent completed date. Do NOT sum with **Value in new Safes**: for refunded exploited pairs a landed refund can be counted in both at once.`,
  "chartType": "numberDisplay",
  "format": "formatCurrencyCompact",
  "valueField": "value",
  "query": "SELECT round(sumIf(b.balance_usd, b.address IN (SELECT address FROM dbt.int_execution_gpay_safe_canonical)), 2) AS value FROM dbt.int_execution_gpay_balances_daily b WHERE b.date = (SELECT max(date) FROM dbt.int_execution_gpay_balances_daily)"
};
export default metric;
