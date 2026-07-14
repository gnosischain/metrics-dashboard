const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_new_registrations",
  "name": "New Registrations (mo)",
  "description": "Last complete month",
  "metricDescription": `New identity/profile registrations in the most recent complete calendar month, counted from each avatar's on-chain registration timestamp (\`avatar.created_at\`). Since every avatar carries a \`profile_id\`, avatar registration is equivalent to account/profile creation. The series spans Circles v1 and v2 back to 2019, making it broader than the bundler-based \`new_users\` heuristic. Unit is a count of avatars; the current incomplete month is excluded.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(new_registrations) AS value FROM dbt.fct_execution_gnosis_app_gt_registrations_monthly WHERE month < toStartOfMonth(today()) ORDER BY month DESC LIMIT 1"
};
export default metric;
