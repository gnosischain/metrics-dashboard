const metric = {
  id: 'api_execution_gnosis_app_kpi_total_users',
  name: 'Total Users',
  description: 'Lifetime',
  metricDescription: `Lifetime count of distinct addresses ever detected as a **Gnosis App user**. An address qualifies when the app's on-chain fingerprint matches: a transaction relayed by an active Cometh ERC-4337 bundler (via the EntryPoint) that triggers any detection rule — a Safe created with the Circles \`InvitationModule\` enabled, a CRC or gCRC fee paid to the Gnosis App fee receiver, a Circles \`RegisterHuman\`, being the canonical inviter of one, a \`Trust\`, a profile-metadata update, or a personal CRC mint. Counts each address once with no time window; off-app activity is not detected and coverage starts 2025-11-12. \`count\``,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_total_users`,
};
export default metric;
