const metric = {
  id: 'api_execution_circles_v2_group_explorer_wrapped_pct_latest',
  name: 'Wrapped %',
  description: 'Share of supply held in the ERC-20 wrapper',
  metricDescription: `Share of this group's total token supply currently held in its ERC-20 wrapper contract(s); the remainder sits as native ERC-1155. Computed as wrapped ÷ total supply (rounded to 1 decimal) from the latest snapshot; it is 0 when the group has no supply.`,
  chartType: 'numberDisplay',
  format: 'formatPercentage',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT wrapped_pct AS value
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
