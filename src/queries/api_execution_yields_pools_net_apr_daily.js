const metric = {
  id: 'api_execution_yields_pools_net_apr_daily',
  name: 'Fee APR',
  description: '7-day trailing by pool',
  metricDescription: 'Annualised fee revenue earned by LPs, computed from a 7-day trailing window of fees divided by average TVL.',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'fee_apr_7d',
  seriesField: 'pool',
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
      fee_apr_7d
    FROM dbt.api_execution_pools_net_apr_daily
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
