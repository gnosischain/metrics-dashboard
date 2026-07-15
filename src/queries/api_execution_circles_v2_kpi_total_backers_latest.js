const metric = {
  id: 'api_execution_circles_v2_kpi_total_backers_latest',
  name: 'Current Backers',
  description: 'Addresses trusted by the backers group',
  metricDescription: `Count of addresses **currently** trusted by the backers group avatar (\`circles_target_group_address\`) — those with at least one still-open trust interval (\`is_currently_trusted\`), so addresses later untrusted drop off. This is a trust-defined population, distinct from depositors (addresses that emitted \`CirclesBackingInitiated\`): not every depositor is trusted, and the group may trust addresses that never deposited. The week-over-week percent change is derived from the cumulative first-trusted series as a growth proxy, since untrust volume is small relative to new trusts.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_total_backers_latest`,
};
export default metric;
