const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_refunds_daily_safes",
  "name": "Exploit refunds landing",
  "description": "Refunded new Safes per day",
  "metricDescription": "Number of exploited (is_lost) new Safes credited with their recovery refund per day \u2014 the refund landed 2026-06-05..09 (15,450 on Jun 6).",
  "chartType": "bar",
  "isTimeSeries": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT date, label, value FROM (SELECT toString(first_refund_at) AS date, 'Refunded new Safes' AS label, toInt64(count(DISTINCT new_safe)) AS value FROM dbt.int_execution_gpay_safe_switchover WHERE is_lost = 1 GROUP BY first_refund_at) ORDER BY date"
};
export default metric;
