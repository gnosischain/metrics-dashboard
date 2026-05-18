const metric = {
  id: 'api_execution_circles_v2_kpi_depositors_in_backers_pct_latest',
  name: 'Depositors → Backers',
  description: '% of depositors that became trust-defined backers',
  metricDescription: 'Share of distinct depositors (addresses that emitted `CirclesBackingInitiated`) that ended up trusted by the backers group. The single most diagnostic number for the depositors-vs-backers gap.',
  chartType: 'numberDisplay',
  format: 'formatPercentage',
  valueField: 'value',
  changeData: { enabled: false },
  query: `SELECT value, total_depositors, depositors_in_backers, change_pct
          FROM dbt.api_execution_circles_v2_kpi_depositors_in_backers_pct_latest`,
};
export default metric;
