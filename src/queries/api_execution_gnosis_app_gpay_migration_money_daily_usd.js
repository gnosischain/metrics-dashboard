const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_money_daily_usd",
  "name": "Value: old vs new Safes (daily)",
  "description": "USD migrating from old to new Safes",
  "metricDescription": "Daily USD held in migrated OLD Safes (pending move) vs NEW Safes since 2026-05-15 \u2014 the money moving across the migration. Series are NOT additive for refunded pairs.",
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
