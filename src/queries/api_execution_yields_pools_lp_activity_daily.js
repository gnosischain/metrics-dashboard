const metric = {
  id: 'api_execution_yields_pools_lp_activity_daily',
  name: 'LP Activity',
  description: 'Daily by pool',
  metricDescription: `Daily count of liquidity provision and removal events per pool for the selected token.

- **Add** — new liquidity positions opened or existing positions increased
- **Remove** — liquidity positions reduced or closed`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'type',
  enableFiltering: true,
  labelField: 'pool',
  globalFilterField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  seriesColorsByName: {
    'Add': '#91cc75',
    'Remove': '#ee6666'
  },
  yAxis: {
    name: 'Events',
    nameLocation: 'middle',
    nameRotate: 90,
    nameGap: 50,
    nameTextStyle: { fontWeight: 500 }
  },
  grid: {
    left: 60
  },
  query: `
    SELECT
      date,
      token,
      label AS pool,
      type,
      value
    FROM dbt.api_execution_yields_pools_lp_activity_daily
    ORDER BY date ASC, token, pool, type
  `,
};

export default metric;
