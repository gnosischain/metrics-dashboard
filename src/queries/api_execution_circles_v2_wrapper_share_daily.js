const metric = {
  id: 'api_execution_circles_v2_wrapper_share_daily',
  name: 'Wrapped Share',
  description: 'ERC-20 wrapped vs unwrapped CRC supply',
  metricDescription: 'Network-wide split of total CRC supply between ERC-20 wrapped (ERC20Lift wrappers) and native ERC-1155 Hub holdings. Shows wrapping adoption over time.',
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
