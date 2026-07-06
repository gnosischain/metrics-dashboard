const metric = {
  "id": "api_execution_gnosis_app_gt_app_generation",
  "name": "App Generation",
  "description": "Current app.gnosis.io vs legacy Metri",
  "metricDescription": "Registered-active wallets by which Gnosis App generation they used: current (app.gnosis.io), legacy (Metri), both, or none.",
  "chartType": "pie",
  "format": "formatNumber",
  "nameField": "app_generation",
  "valueField": "value",
  "query": "SELECT app_generation, toInt64(count()) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public WHERE is_registered_active GROUP BY app_generation ORDER BY value DESC"
};
export default metric;
