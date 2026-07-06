const metric = {
  "id": "api_execution_gnosis_app_gt_registrations_monthly",
  "name": "New Registrations",
  "description": "Identity/profile creation per month (v1 vs v2)",
  "metricDescription": "New Circles identity/profile registrations per month (avatar.created_at = account creation; 100% have a profile). Broader than the heuristic new_users (new-to-bundler); spans v1+v2.",
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
