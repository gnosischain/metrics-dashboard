const metric = {
  "id": "growth_ga_wau_weau_weekly",
  "name": "GA WAU vs WEAU (weekly)",
  "description": "In-app WAU vs economically-active WAU",
  metricDescription: `Two weekly series for the Gnosis App. **WAU (in-app)** = distinct addresses with at least one non-onboarding in-app action that week (\`activity_kind != 'onboard'\`; the headline WAU population, same as DAU/MAU). **WEAU (economically active)** = the strict subset of those addresses that also earned >= 1 Circles reward (gCRC cashback or CRC inviter fee) in the same week; only non-blacklisted addresses (\`is_blacklisted=0\`) are counted here, so WEAU/WAU reads as a clean activation rate. Latest incomplete week excluded. Unit: distinct-address counts.`,
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
