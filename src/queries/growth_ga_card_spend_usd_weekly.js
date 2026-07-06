const metric = {
  "id": "growth_ga_card_spend_usd_weekly",
  "name": "GA card spend (USD, weekly)",
  "description": "Card payments on GA-controlled cards",
  "metricDescription": "Weekly USD card payments (action=Payment) on Gnosis-App-CONTROLLED Gnosis Pay Safes, split by onboarding_class. GA-scoped (~$22.6M lifetime) - NOT the all-GP total (~$186M, which duplicates the gnosis-pay dashboard). Source: fct_execution_gnosis_app_gpay_volume_daily.",
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatCurrency",
  "query": "SELECT toString(toStartOfWeek(date, 1)) AS date, onboarding_class AS label, toInt64(round(sum(spend_usd))) AS value FROM dbt.api_execution_gnosis_app_gpay_volume_daily WHERE date >= '2024-01-01' GROUP BY date, label ORDER BY date"
};
export default metric;
