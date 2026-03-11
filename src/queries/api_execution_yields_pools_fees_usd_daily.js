const metric = {
  id: 'api_execution_yields_pools_fees_usd_daily',
  name: 'Fee Revenue',
  description: 'Daily by pool',
  metricDescription: 'Daily gross fee revenue in USD broken down by pool for the selected token. Derived from Swap and Flash events on Uniswap V3 and Swapr V3.',
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
    FROM dbt.api_execution_yields_pools_fees_usd_daily
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
