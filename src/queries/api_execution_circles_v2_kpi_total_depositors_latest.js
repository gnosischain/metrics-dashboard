const metric = {
  id: 'api_execution_circles_v2_kpi_total_depositors_latest',
  name: 'Total Depositors',
  description: 'Addresses that have pledged collateral',
  metricDescription: 'Distinct addresses that have emitted at least one `CirclesBackingInitiated` event. **Not** the same as trust-defined backers — see the "Backers" tile next to this one. The 7d delta is the new-depositors count vs the prior 7-day window.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, new_last_7d, change_pct FROM dbt.api_execution_circles_v2_kpi_total_depositors_latest`,
};
export default metric;
