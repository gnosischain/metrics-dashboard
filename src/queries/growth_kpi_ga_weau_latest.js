const metric = {
  "id": "growth_kpi_ga_weau_latest",
  "name": "GA WEAU (latest week)",
  "description": "Economically active weekly users",
  "metricDescription": "Gnosis App weekly economically-active users (non-blacklisted), most recent complete week. A strict subset of WAU.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "query": "SELECT toInt64(sumIf(cnt, is_blacklisted=0)) AS value FROM dbt.api_execution_gnosis_app_weekly_economically_active_users WHERE week IS NOT NULL GROUP BY week ORDER BY week DESC LIMIT 1"
};
export default metric;
