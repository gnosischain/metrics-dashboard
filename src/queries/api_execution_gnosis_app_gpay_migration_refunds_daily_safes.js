const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_refunds_daily_safes",
  "name": "Exploit refunds landing",
  "description": "Refunded new Safes per day",
  "metricDescription": `Number of exploited (\`is_lost = 1\`) **new** Safes whose exploit-recovery refund first landed on each day, keyed by \`first_refund_at\` in \`int_execution_gpay_safe_switchover\`. Each refunded new Safe is counted once, on its first-refund date; refunds landed in early June 2026 (2026-06-05..09), concentrated in the first days. Daily count.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT date, label, value FROM (SELECT toString(first_refund_at) AS date, 'Refunded new Safes' AS label, toInt64(count(DISTINCT new_safe)) AS value FROM dbt.int_execution_gpay_safe_switchover WHERE is_lost = 1 GROUP BY first_refund_at) ORDER BY date"
};
export default metric;
