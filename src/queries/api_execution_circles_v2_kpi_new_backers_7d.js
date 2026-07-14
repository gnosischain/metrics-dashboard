const metric = {
  id: 'api_execution_circles_v2_kpi_new_backers_7d',
  name: 'New Backers (7d)',
  description: 'Backers newly trusted in the last 7 days',
  metricDescription: `Number of addresses that first became **backers** in the last 7 days, dated by their earliest trust from the backers group (\`first_trusted_at\`), with week-over-week percent change. A **backer** is any address trusted by the designated backers group avatar (\`circles_target_group_address\`) — a trust-defined set, distinct from depositors (addresses that emitted a \`CirclesBackingInitiated\` event). Counted at first-ever trust, so an address re-trusted after being untrusted is not recounted.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_new_backers_7d`,
};
export default metric;
