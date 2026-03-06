const metric = {
  id: 'api_execution_yields_pools_volume_daily',
  name: 'Trading Volume',
  description: 'Daily by pool',
  metricDescription: 'Daily gross trading volume in USD broken down by pool for the selected token. Derived from Swap events on Uniswap V3 and Swapr V3.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  enableFiltering: true,
  labelField: 'pool',
  globalFilterField: 'token',
  format: 'formatValue',
  tooltipOrder: 'valueDesc',
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
      value
    FROM dbt.api_execution_yields_pools_volume_daily
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
