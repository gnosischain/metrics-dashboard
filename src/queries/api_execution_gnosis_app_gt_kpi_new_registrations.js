const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_new_registrations",
  "name": "New Registrations (mo)",
  "description": "Last complete month",
  "metricDescription": "New identity/profile registrations in the most recent complete month.",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(new_registrations) AS value FROM dbt.fct_execution_gnosis_app_gt_registrations_monthly WHERE month < toStartOfMonth(today()) ORDER BY month DESC LIMIT 1"
};
export default metric;
