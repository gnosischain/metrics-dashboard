const metric = {
  id: 'api_execution_yields_pools_fee_apr_7d_daily',
  name: 'Pools Fee APR (7D)',
  description: '7D trailing fee APR for Uniswap V3 / Swapr V3 pools',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  enableFiltering: true,
  labelField: 'pool',
  globalFilterField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  smooth: true,
  symbolSize: 4,
  lineWidth: 2,
  yAxis: {
    name: '%',
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
    FROM dbt.api_execution_yields_pools_fee_apr_7d_daily
    WHERE date >= '{from}'
      AND date <= '{to}'
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
