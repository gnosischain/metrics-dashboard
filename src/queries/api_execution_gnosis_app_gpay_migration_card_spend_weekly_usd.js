const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_card_spend_weekly_usd",
  "name": "Card spend on migrated cards",
  "description": "Weekly card-payment USD",
  "metricDescription": "Weekly card-payment volume (action='Payment', amount_usd) on migrated NEW Safes since the migration \u2014 the money-adoption signal (~$1.8M/week, ~4.5k spenders).",
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatCurrency",
  "query": "SELECT toString(toStartOfWeek(a.date, 1)) AS date, 'Card spend (USD)' AS label, toInt64(round(sum(a.amount_usd))) AS value FROM dbt.int_execution_gpay_activity a INNER JOIN (SELECT lower(canonical_address) AS n FROM dbt.int_execution_gpay_safe_canonical) c ON lower(a.wallet_address) = c.n WHERE a.action = 'Payment' AND a.date >= '2026-06-01' GROUP BY date ORDER BY date"
};
export default metric;
