const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_active_wallets_30d",
  "name": "Active Wallets (30d)",
  "description": "Any on-chain action, last 30d",
  metricDescription: `Count of app-engaged wallets active in the last 30 days: \`is_active_30d\` = the wallet's most recent on-chain action (\`last_action_at\`, from \`transaction_action.timestamp\`) falls within 30 days of the build time. Any on-chain action counts (not just deliberate app-feature actions). Scope is the per-wallet rollup of registered/app-engaged identities. Rolling 30-day window; unit is wallet count, point-in-time.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_active_30d)) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public"
};
export default metric;
