const metric = {
  "id": "growth_ga_card_funded_usd_weekly",
  "name": "GA card funding (USD, weekly)",
  "description": "Money loaded onto GA-controlled cards",
  "metricDescription": "Weekly USD inflows (Fiat Top Up + Crypto Deposit) on Gnosis-App-CONTROLLED Gnosis Pay Safes, split by onboarding_class (onboarded_via_ga vs imported). GA-scoped via is_currently_ga_owned - NOT the all-GP total (the GP-wide figure lives on the gnosis-pay dashboard). Source: fct_execution_gnosis_app_gpay_volume_daily.",
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatCurrency",
  "query": "SELECT toString(toStartOfWeek(date, 1)) AS date, onboarding_class AS label, toInt64(round(sum(funded_volume_usd))) AS value FROM dbt.api_execution_gnosis_app_gpay_volume_daily WHERE date >= '2024-01-01' GROUP BY date, label ORDER BY date"
};
export default metric;
