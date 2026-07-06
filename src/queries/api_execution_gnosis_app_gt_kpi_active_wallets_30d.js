const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_active_wallets_30d",
  "name": "Active Wallets (30d)",
  "description": "Any on-chain action, last 30d",
  "metricDescription": "App-engaged wallets active in the last 30 days.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_active_30d)) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public"
};
export default metric;
