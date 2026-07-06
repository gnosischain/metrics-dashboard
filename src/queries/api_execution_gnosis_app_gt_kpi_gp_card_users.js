const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_gp_card_users",
  "name": "GP-Card Wallets",
  "description": "Linked to a Gnosis Pay card",
  "metricDescription": "Wallets linked to a Gnosis Pay card (cashback owner or top-up funder) \u2014 the ground-truth GA\u2194card bridge.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_gp_card_user)) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public"
};
export default metric;
