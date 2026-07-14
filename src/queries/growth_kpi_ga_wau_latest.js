const metric = {
  "id": "growth_kpi_ga_wau_latest",
  "name": "GA WAU (latest week)",
  "description": "In-app weekly active users",
  "metricDescription": `Distinct Gnosis App addresses with at least one **in-app action** in the most recent complete week (ISO weeks starting Monday; the current partial week is excluded). **Active** = any non-\`onboard\` activity that week — a CoW swap signed or filled, a gPay top-up, a marketplace buy, a token-offer claim, or a heuristic-matched Gnosis App on-chain event; an address that only onboarded (no other action) does **not** count. Same in-app population as the DAU/MAU headline, and GA WEAU (economically active) is a strict subset. Unit: distinct addresses (count).`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "query": "SELECT toInt64(active_users) AS value FROM dbt.api_execution_gnosis_app_weekly_active_users ORDER BY week DESC LIMIT 1"
};
export default metric;
