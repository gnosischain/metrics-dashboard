const metric = {
  id: 'api_execution_gnosis_app_kpi_swap_volume_7d',
  name: 'Swap Volume',
  description: 'Last 7 days',
  metricDescription: `USD notional of *filled* CoW Protocol swaps signed by \`Gnosis App\` users in the last 7 full days (today excluded), bucketed by the day the order was signed. Only orders that actually executed contribute; signed-but-unfilled orders and filled orders that could not be USD-priced count as 0. A swap is a \`PreSignature\` order from \`GPv2Settlement\` routed through the Cometh ERC-4337 bundler whose owner is a Gnosis App user (data starts 2025-11-12). Change is vs the prior 7 days.`,
  chartType: 'numberDisplay',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_swap_volume_7d`,
};
export default metric;
