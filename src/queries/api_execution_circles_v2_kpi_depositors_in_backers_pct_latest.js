const metric = {
  id: 'api_execution_circles_v2_kpi_depositors_in_backers_pct_latest',
  name: 'Depositors → Backers',
  description: '% of depositors that became trust-defined backers',
  metricDescription: `**Depositors -> Backers** is the share (%) of distinct depositors who also became trust-defined backers. A **depositor** is any address that has emitted a \`CirclesBackingInitiated\` event (started a backing deposit). A **backer** is any address trusted by the backers group avatar (\`circles_target_group_address\`). This measures how many depositors were eventually trusted into the backers group: a depositor is not automatically a backer, and the group can trust addresses that never deposited. Denominator = all distinct depositors; expressed as a percentage.`,
  chartType: 'numberDisplay',
  format: 'formatPercentage',
  valueField: 'value',
  changeData: { enabled: false },
  query: `SELECT value, total_depositors, depositors_in_backers, change_pct
          FROM dbt.api_execution_circles_v2_kpi_depositors_in_backers_pct_latest`,
};
export default metric;
