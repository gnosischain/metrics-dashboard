const metric = {
  id: 'api_execution_circles_v2_group_explorer_token_supply_daily',
  name: 'Token Supply (daily)',
  metricDescription: `Daily circulating supply of this group's CRC token over time, in CRC. Derived from net minting (the negated zero-address balance), which already includes the ERC-1155 held by ERC-20 wrapper contracts — wrapped tokens are a subset of this supply, not additional. Nominal amount, not demurrage-adjusted; the latest incomplete day (today) is excluded. The wrapped share is surfaced as a separate KPI above.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  globalFilterField: 'group_address',
  xField: 'date',
  yField: 'value',
  format: 'formatNumber',
  query: `
    SELECT date, supply AS value
    FROM dbt.api_execution_circles_v2_group_supply_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};
export default metric;
