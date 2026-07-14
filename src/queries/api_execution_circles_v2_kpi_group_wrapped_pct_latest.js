const metric = {
  id: 'api_execution_circles_v2_kpi_group_wrapped_pct_latest',
  name: 'Group Wrapped %',
  description: 'Share of group-token supply held as ERC-20 wrappers',
  metricDescription: `Share of all Circles v2 **group-token** supply held as ERC-20 wrappers rather than native ERC-1155, as a percent (\`supply_wrapped_erc20 / supply_total\`). A **group token** is a personal CRC token whose issuer avatar has \`avatar_type = 'Group'\`; the **wrapped** portion is supply sitting in known wrapper contracts (mapped via \`int_execution_circles_v2_wrappers\`). Measured on raw (non-demurraged) balances at the latest complete day, with the change shown as the percentage-point delta versus the same point 7 days ago.`,
  chartType: 'numberDisplay',
  format: 'formatPercentage',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'pp vs 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_group_wrapped_pct_latest`,
};
export default metric;
