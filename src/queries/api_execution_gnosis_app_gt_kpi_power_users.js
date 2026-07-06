const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_power_users",
  "name": "Power Users",
  "description": "High-breadth + active 30d",
  "metricDescription": "Wallets that used >=3 distinct app-tagged action types AND were active in the last 30 days.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_power_user)) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public"
};
export default metric;
