const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_gp_card_users",
  "name": "GP-Card Wallets",
  "description": "Linked to a Gnosis Pay card",
  "metricDescription": `Count of distinct Gnosis-Tribe wallet identities flagged \`is_gp_card_user\` \u2014 **linked to a Gnosis Pay card**, meaning the wallet either received Gnosis Pay cashback (\`has_cashback\`) or funded a card top-up (\`has_pay_topup\`, a \`PayTopUp\` or \`AutoTopup\` transfer). This is the ground-truth bridge between the Gnosis App and Gnosis Pay cards. It is a live snapshot over the whole per-identity wallet table (no time window); each identity is counted once regardless of how many cards or top-ups it holds.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(countIf(is_gp_card_user)) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_metrics_public"
};
export default metric;
