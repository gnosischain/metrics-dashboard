const metric = {
  "id": "api_execution_gnosis_app_gt_registrations_monthly",
  "name": "New Registrations",
  "description": "Identity/profile creation per month (v1 vs v2)",
  "metricDescription": `Monthly count of new Circles identity registrations, taken from each avatar's on-chain registration timestamp (\`created_at\`) — because every avatar carries a \`profile_id\`, avatar registration equals account/profile creation. Bars are stacked by protocol version: \`v2\` (\`circles_version = 2\`) vs \`v1\` (\`circles_version = 1\`). This counts every registration back to 2020, so it is broader than the heuristic \`new_users\` metric, which counts only addresses new to the current app's bundler. The current, incomplete month is excluded.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "stacked": true,
  "enableZoom": true,
  "showTotal": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT date, label, value FROM (SELECT toDate(month) AS date, 'v2' AS label, toInt64(v2_registrations) AS value FROM dbt.fct_execution_gnosis_app_gt_registrations_monthly UNION ALL SELECT toDate(month) AS date, 'v1' AS label, toInt64(v1_registrations) AS value FROM dbt.fct_execution_gnosis_app_gt_registrations_monthly) ORDER BY date ASC, label ASC"
};
export default metric;
