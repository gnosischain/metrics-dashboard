const metric = {
  id: 'api_execution_yields_pools_swap_count_daily',
  name: 'Swap Count',
  description: 'Daily by pool',
  metricDescription: 'Daily number of swap transactions per pool for the selected token. Counts individual Swap events on Uniswap V3 and Swapr V3.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  enableFiltering: true,
  labelField: 'pool',
  globalFilterField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  yAxis: {
    name: 'Swaps',
    nameLocation: 'middle',
    nameRotate: 90,
    nameGap: 60,
    nameTextStyle: { fontWeight: 500 }
  },
  grid: {
    left: 70
  },
  query: `
    SELECT
      date,
      token,
      label AS pool,
      value
    FROM dbt.api_execution_yields_pools_swap_count_daily
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
