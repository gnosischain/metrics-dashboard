const metric = {
  id: 'api_execution_circles_v2_kpi_group_token_supply_latest',
  name: 'Group Token Supply',
  description: 'Total CRC across all group personal tokens',
  metricDescription: 'Aggregate Circles v2 group-token supply (native ERC-1155 + ERC-20 wrappers combined), measured on the latest complete day. WoW pct change.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_group_token_supply_latest`,
};
export default metric;
