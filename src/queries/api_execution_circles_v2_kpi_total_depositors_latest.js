const metric = {
  id: 'api_execution_circles_v2_kpi_total_depositors_latest',
  name: 'Total Depositors',
  description: 'Addresses that have pledged collateral',
  metricDescription: `**Depositors** = distinct addresses that have emitted at least one \`CirclesBackingInitiated\` event on the Circles Backing Factory, i.e. pledged collateral (a supported backing asset) to back their personal CRC. Each address is counted once, all-time cumulative. This is the transactional depositor set, **not** the trust-defined "backers" set (members of the backers group's trust list) — see the neighbouring Backers tile. The 7-day change compares the count of addresses whose *first* deposit fell in the last 7 days against those in the prior 7 days (a flow-vs-flow delta, not growth of the running total).`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'new vs prior 7d' },
  query: `SELECT value, new_last_7d, change_pct FROM dbt.api_execution_circles_v2_kpi_total_depositors_latest`,
};
export default metric;
