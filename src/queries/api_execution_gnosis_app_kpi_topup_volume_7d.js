const metric = {
  id: 'api_execution_gnosis_app_kpi_topup_volume_7d',
  name: 'TopUp Volume',
  description: 'Last 7 days',
  metricDescription: `Total USD value topped up from the Gnosis App (GA) into Gnosis Pay (GP) in the last 7 full days (rolling window ending yesterday), versus the prior 7 days. A **top-up** is a Gnosis Pay \`Crypto Deposit\` into a GP wallet that is currently GA-owned (per the \`int_execution_gnosis_app_gpay_wallets\` bridge), counted from the GA launch on 2025-11-12 onward. Scope is intentionally broad: **all** such deposits count — self-funding and deposits predating GA ownership are not filtered out. Sums \`volume_usd\` across all deposited tokens (e.g. EURe, USDC).`,
  chartType: 'numberDisplay',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_topup_volume_7d`,
};
export default metric;
