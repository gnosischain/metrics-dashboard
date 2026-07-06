const metric = {
  "id": "growth_kpi_ga_wau_latest",
  "name": "GA WAU (latest week)",
  "description": "In-app weekly active users",
  "metricDescription": "Gnosis App in-app weekly active users, most recent complete week. WEAU (economically active) is a strict subset of this.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "query": "SELECT toInt64(active_users) AS value FROM dbt.api_execution_gnosis_app_weekly_active_users ORDER BY week DESC LIMIT 1"
};
export default metric;
