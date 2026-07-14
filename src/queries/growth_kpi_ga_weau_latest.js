const metric = {
  "id": "growth_kpi_ga_weau_latest",
  "name": "GA WEAU (latest week)",
  "description": "Economically active weekly users",
  "metricDescription": `Distinct Gnosis App addresses that were **both** in-app active AND earned at least one Circles reward in the same week — most recent complete week, counting only addresses **not** on the Circles blacklist (\`is_blacklisted = 0\`). **Economically active** = the WAU population intersected with weekly earners, where an earner received >= 1 \`gcrc_cashback\` (attributed by Gnosis App membership, since cashback carries no tx origin) or >= 1 CRC \`inviter_fee\` that flowed through a Gnosis App relayer tx that week; rewards earned via other apps or directly on-chain are excluded. A strict subset of GA WAU, so WEAU / WAU is the activation rate. The current partial week is excluded. Unit: distinct addresses (count).`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "query": "SELECT toInt64(sumIf(cnt, is_blacklisted=0)) AS value FROM dbt.api_execution_gnosis_app_weekly_economically_active_users WHERE week IS NOT NULL GROUP BY week ORDER BY week DESC LIMIT 1"
};
export default metric;
