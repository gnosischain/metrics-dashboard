const metric = {
  id: 'api_execution_circles_v2_wrapper_share_daily',
  name: 'Wrapped Share',
  description: 'ERC-20 wrapped vs unwrapped CRC supply',
  metricDescription: `Daily split of total Circles CRC supply between **ERC-20 wrapped** tokens and **native ERC-1155 Hub** balances. \`wrapped\` = cumulative wrapped supply across all ERC20Lift wrapper tokens, where a wrap is an ERC-20 \`Transfer\` minted from the zero address (+amount) and an unwrap is a \`Transfer\` burned to the zero address (-amount); transfers between holders don't change it. \`unwrapped\` = total network supply (from the total-supply model) minus wrapped. Values are in CRC (18 decimals); the current incomplete day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'state',
  query: `
    SELECT date, 'wrapped'   AS state, wrapped_supply   AS value
    FROM dbt.api_execution_circles_v2_wrapper_share_daily
    UNION ALL
    SELECT date, 'unwrapped' AS state, unwrapped_supply AS value
    FROM dbt.api_execution_circles_v2_wrapper_share_daily
    ORDER BY date, state
  `,
};
export default metric;
