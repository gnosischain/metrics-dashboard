const metric = {
  id: 'api_execution_circles_v2_group_explorer_supply_latest',
  name: 'Group Token Supply',
  metricDescription: `Latest total circulating supply of this group's own personal CRC token, in CRC. Sums the group token held across **all** holder categories — native ERC-1155 plus the portion wrapped as ERC-20 (wrapped is a subset of the total, not added on top). Nominal amount, not demurrage-adjusted; balances below the 0.001 CRC dust threshold are excluded.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT supply AS value
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
