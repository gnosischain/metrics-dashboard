const metric = {
  id: 'api_execution_circles_v2_kpi_group_wrapped_pct_latest',
  name: 'Group Wrapped %',
  description: 'Share of group-token supply held as ERC-20 wrappers',
  metricDescription: 'Share of aggregate Circles v2 group-token supply currently held as ERC-20 wrappers (versus native ERC-1155). 7-day percentage-point delta.',
  chartType: 'numberDisplay',
  format: 'formatPercentage',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'pp vs 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_group_wrapped_pct_latest`,
};
export default metric;
