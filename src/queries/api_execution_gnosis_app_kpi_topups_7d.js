const metric = {
  id: 'api_execution_gnosis_app_kpi_topups_7d',
  name: 'TopUps (7d)',
  description: 'Last 7 days',
  metricDescription: `Number of Gnosis App (GA) to Gnosis Pay (GP) top-ups in the last 7 full days (rolling window ending yesterday), versus the prior 7 days. A **top-up** is a single Gnosis Pay \`Crypto Deposit\` event into a wallet that is currently GA-owned (per the \`int_execution_gnosis_app_gpay_wallets\` bridge), from the GA launch on 2025-11-12 onward. Counts all such deposit events (\`sum(n_topups)\`); self-funding and pre-GA-ownership deposits are not excluded, and one wallet can contribute several top-ups.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_topups_7d`,
};
export default metric;
