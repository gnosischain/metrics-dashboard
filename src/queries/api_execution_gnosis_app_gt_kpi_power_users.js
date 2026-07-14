const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_power_users",
  "name": "Power Users",
  "description": "High-breadth + active 30d",
  "metricDescription": `Count of wallets flagged \`is_power_user\` = used **at least 3 distinct app-tagged action types** AND active in the last 30 days. \`app_action_breadth\` counts how many of 8 app-tagged action types the wallet has ever performed (gnosis.io swap, Metri swap, \`MetriFee\`, \`MetriTransfer\`, pay top-up, cashback, auto-invest, auto-topup); \`is_active_30d\` = last on-chain action within 30 days of the model build. Live snapshot over all wallets, deduplicated per identity.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_power_user)) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public"
};
export default metric;
