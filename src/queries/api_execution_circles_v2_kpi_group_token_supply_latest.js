const metric = {
  id: 'api_execution_circles_v2_kpi_group_token_supply_latest',
  name: 'Group Token Supply',
  description: 'Total CRC across all group personal tokens',
  metricDescription: `Aggregate outstanding supply of all Circles v2 **group** tokens on the latest complete day, in CRC. A group token is a personal CRC token whose issuer avatar has \`avatar_type = 'Group'\`; the total sums holdings across both native ERC-1155 balances and their ERC-20 wrappers (\`supply_native_erc1155\` + \`supply_wrapped_erc20\`). Uses the nominal (non-demurraged) balance, not the demurrage-adjusted figure. \`change_pct\` is the week-over-week change versus the supply 7 days earlier.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_group_token_supply_latest`,
};
export default metric;
