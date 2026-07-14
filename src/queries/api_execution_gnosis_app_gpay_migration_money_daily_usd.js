const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_money_daily_usd",
  "name": "Value: old vs new Safes (daily)",
  "description": "USD migrating from old to new Safes",
  metricDescription: `Two daily USD lines since 2026-05-15: total value held in migrated **old** Safes (funds still pending move) versus in the **new** canonical Safes, summing \`balance_usd\` across all tokens from \`int_execution_gpay_balances_daily\` for the old (\`address\`) and new (\`canonical_address\`) sides of \`int_execution_gpay_safe_canonical\`. Tracks the money shifting across the migration boundary. Unit: USD (rounded). Note: the two lines are not strictly additive for refunded pairs \u2014 exploit-recovery refunds land on the new Safe days after migration while a residual balance can linger on the old Safe.`,
  "chartType": "line",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatCurrency",
  "query": "SELECT date, label, value FROM (SELECT b.date AS date, 'old safes (pending move)' AS label, toInt64(round(sum(b.balance_usd))) AS value FROM dbt.int_execution_gpay_balances_daily AS b WHERE b.date >= '2026-05-15' AND b.address IN (SELECT address FROM dbt.int_execution_gpay_safe_canonical) GROUP BY b.date UNION ALL SELECT b.date AS date, 'new safes' AS label, toInt64(round(sum(b.balance_usd))) AS value FROM dbt.int_execution_gpay_balances_daily AS b WHERE b.date >= '2026-05-15' AND b.address IN (SELECT canonical_address FROM dbt.int_execution_gpay_safe_canonical) GROUP BY b.date ) AS s ORDER BY date ASC, label ASC"
};
export default metric;
