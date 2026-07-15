const metric = {
  id: 'api_execution_circles_v2_group_explorer_collateral_daily',
  name: 'Collateral (daily)',
  description: 'End-of-day member CRC collateral',
  metricDescription: `End-of-day total member Circles (\`CRC\`) locked as collateral backing this group's token, in native CRC units, summed across every backing token id the group holds. It is the running total of collateral deposited minus redeemed; only positive balances are shown. Score-based groups mint against an on-chain score rather than locked collateral, so they hold no member-CRC collateral and the series is empty for them. Grain is daily and the current incomplete day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  globalFilterField: 'group_address',
  xField: 'date',
  yField: 'value',
  format: 'formatNumber',
  query: `
    SELECT date, collateral AS value
    FROM dbt.api_execution_circles_v2_group_collateral_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};
export default metric;
