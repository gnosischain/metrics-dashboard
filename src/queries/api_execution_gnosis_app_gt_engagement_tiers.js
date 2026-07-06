const metric = {
  "id": "api_execution_gnosis_app_gt_engagement_tiers",
  "name": "Engagement Tiers",
  "description": "power / core / casual / inactive",
  "metricDescription": "Wallet segmentation by engagement: power (breadth>=3 & active-30d), core, casual, inactive (registered but no app-tagged action).",
  "chartType": "pie",
  "format": "formatNumber",
  "nameField": "engagement_tier",
  "valueField": "value",
  "query": "SELECT engagement_tier, toInt64(count()) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public GROUP BY engagement_tier ORDER BY value DESC"
};
export default metric;
