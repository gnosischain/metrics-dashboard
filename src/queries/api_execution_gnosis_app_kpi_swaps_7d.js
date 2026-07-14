const metric = {
  id: 'api_execution_gnosis_app_kpi_swaps_7d',
  name: 'Swaps (7d)',
  description: 'Last 7 days',
  metricDescription: `Count of CoW Protocol orders signed by \`Gnosis App\` users in the last 7 full days (today excluded), by signing date. Each order is one \`PreSignature\` event (\`signed=1\`, revocations excluded) from \`GPv2Settlement\`, routed through the Cometh ERC-4337 bundler, with a Gnosis App user as owner; data starts 2025-11-12. Both filled and unfilled orders count — see Swap Volume for filled USD notional. Change is vs the prior 7 days.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_swaps_7d`,
};
export default metric;
