const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivation_weekly",
  "name": "Card reactivation (cumulative)",
  "description": "Migrated cards that went active, weekly",
  "metricDescription": `Cumulative count of distinct **new** (migrated) Safes that have become active, bucketed by the Monday-start week in which each Safe **first** acted (activity from \`2026-06-01\` on). Each Safe is counted once, in its first-active week, then summed cumulatively across weeks. Two series: **any activity** = first \`int_execution_gpay_activity\` row of any action; **card spend** = first row with \`action = 'Payment'\` (a spend to the Gnosis Pay merchant contract). Count.`,
  "chartType": "line",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT date, label, value FROM (SELECT wk AS date, 'any activity' AS label, toInt64(sum(new_safes) OVER (ORDER BY wk ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)) AS value FROM (SELECT wk, count() AS new_safes FROM (SELECT c.canonical_address AS safe, toStartOfWeek(min(a.date), 1) AS wk FROM dbt.int_execution_gpay_activity a INNER JOIN dbt.int_execution_gpay_safe_canonical c ON lower(a.wallet_address) = c.canonical_address WHERE a.date >= '2026-06-01' GROUP BY c.canonical_address) GROUP BY wk) UNION ALL SELECT wk AS date, 'card spend' AS label, toInt64(sum(new_safes) OVER (ORDER BY wk ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)) AS value FROM (SELECT wk, count() AS new_safes FROM (SELECT c.canonical_address AS safe, toStartOfWeek(min(a.date), 1) AS wk FROM dbt.int_execution_gpay_activity a INNER JOIN dbt.int_execution_gpay_safe_canonical c ON lower(a.wallet_address) = c.canonical_address WHERE a.date >= '2026-06-01' AND a.action = 'Payment' GROUP BY c.canonical_address) GROUP BY wk) ) AS t ORDER BY label, date"
};
export default metric;
