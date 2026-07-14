const metric = {
  "id": "api_execution_gnosis_app_gt_app_generation",
  "name": "App Generation",
  "description": "Current app.gnosis.io vs legacy Metri",
  metricDescription: `Distribution of active Gnosis App wallets by which app generation they used: \`current\` (app.gnosis.io only), \`legacy\` (Metri only), \`both\`, or \`none\`. Denominator is \`is_registered_active\` = an identity in the GA user registry that performed at least one app-tagged action (swap / \`MetriFee\` / \`MetriTransfer\` / pay-topup / cashback / investment / auto-topup) — the canonical GT active-user set; dormant registered users (the majority of the registry) are excluded. Unit: wallet count, point-in-time snapshot.`,
  "chartType": "pie",
  "format": "formatNumber",
  "nameField": "app_generation",
  "valueField": "value",
  "query": "SELECT app_generation, toInt64(count()) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public WHERE is_registered_active GROUP BY app_generation ORDER BY value DESC"
};
export default metric;
