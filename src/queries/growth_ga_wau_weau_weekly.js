const metric = {
  "id": "growth_ga_wau_weau_weekly",
  "name": "GA WAU vs WEAU (weekly)",
  "description": "In-app WAU vs economically-active WAU",
  "metricDescription": "Gnosis App weekly active users (in-app) vs weekly economically-active users (WEAU, a strict subset). WEAU counts non-blacklisted economically-active addresses.",
  "chartType": "line",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT date, label, value FROM (SELECT toString(week) AS date, 'WAU (in-app)' AS label, toInt64(active_users) AS value FROM dbt.api_execution_gnosis_app_weekly_active_users UNION ALL SELECT toString(week) AS date, 'WEAU (economically active)' AS label, toInt64(sumIf(cnt, is_blacklisted=0)) AS value FROM dbt.api_execution_gnosis_app_weekly_economically_active_users WHERE week IS NOT NULL GROUP BY week) ORDER BY date"
};
export default metric;
