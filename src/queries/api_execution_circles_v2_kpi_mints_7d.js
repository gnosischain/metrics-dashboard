const metric = {
  id: 'api_execution_circles_v2_kpi_mints_7d',
  name: 'Mints (7d)',
  description: 'Mint events in last 7 days',
  metricDescription: `Total Circles v2 mint events network-wide over the last 7 complete days (today excluded as incomplete), with percent change versus the prior 7-day window. Counts every mint \`TransferSingle\` across **all** \`mint_kind\` values — \`personal\`, \`group\`, \`migration\` and \`other\` — not just personal mints. Each event is one on-chain mint (a recipient may mint on multiple days); the CRC amount minted is tracked separately and not shown on this tile.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_mints_7d`,
};
export default metric;
