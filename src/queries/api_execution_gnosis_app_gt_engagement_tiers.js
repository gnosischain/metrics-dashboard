const metric = {
  "id": "api_execution_gnosis_app_gt_engagement_tiers",
  "name": "Engagement Tiers",
  "description": "power / core / casual / inactive",
  metricDescription: `Segments every wallet in the per-wallet rollup by \`engagement_tier\`, assigned in order: \`inactive\` = not \`is_registered_active\` (registered but never took an app-tagged action); \`power\` = \`app_action_breadth\` >= 3 AND active in the last 30 days; \`core\` = breadth >= 2 OR active in the last 30 days; \`casual\` = everyone else. \`app_action_breadth\` is the number of distinct app-tagged action TYPES a wallet used (0-8: gnosis.io swap, Metri swap, \`MetriFee\`, \`MetriTransfer\`, pay-topup, cashback, investment, auto-topup); 30-day activity is measured from \`transaction_action.timestamp\`. Unit: wallet count, point-in-time.`,
  "chartType": "pie",
  "format": "formatNumber",
  "nameField": "engagement_tier",
  "valueField": "value",
  "query": "SELECT engagement_tier, toInt64(count()) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public GROUP BY engagement_tier ORDER BY value DESC"
};
export default metric;
