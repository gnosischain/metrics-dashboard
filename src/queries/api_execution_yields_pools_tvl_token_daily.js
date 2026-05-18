const metric = {
  id: 'api_execution_yields_pools_tvl_token_daily',
  name: 'TVL by Token',
  description: 'Daily by token',
  metricDescription: 'Stacked area showing each token\'s contribution to pool TVL.\n'
    + 'Denomination toggle: USD or either pool token (cross-rate computed server-side).\n'
    + 'Select a pool from the dropdown to see its composition.',
  chartType: 'area',
  xField: 'date',
  yField: 'tvl_usd',
  seriesField: 'series',
  isTimeSeries: true,
  smooth: true,
  enableZoom: true,
  enableFiltering: true,
  labelField: 'pool',
  globalFilterField: 'token',
  tooltipOrder: 'valueDesc',
  unitFields: {
    usd:    { field: 'tvl_usd',       format: 'formatCurrency', label: 'USD' },
    token0: { field: 'tvl_in_token0', format: 'formatNumber',   labelField: 'token0_symbol' },
    token1: { field: 'tvl_in_token1', format: 'formatNumber',   labelField: 'token1_symbol' }
  },
  areaOpacity: 0.4,
  yAxis: {
    name: 'USD',
    nameLocation: 'middle',
    nameRotate: 90,
    nameGap: 70,
    nameTextStyle: { fontWeight: 500 }
  },
  grid: {
    left: 80
  },
  query: `
    SELECT
      date,
      token,
      label AS pool,
      series,
      tvl_usd,
      tvl_in_token0,
      tvl_in_token1,
      token0_symbol,
      token1_symbol,
      token_amount
    FROM dbt.api_execution_pools_tvl_token_daily
    ORDER BY date ASC, token, pool, series
  `,
};

export default metric;
