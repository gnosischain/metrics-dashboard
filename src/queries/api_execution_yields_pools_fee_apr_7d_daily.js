const metric = {
  id: 'api_execution_yields_pools_fee_apr_7d_daily',
  name: 'Fee APR',
  description: '7D trailing by pool',
  metricDescription: 'Daily 7-day trailing fee APR by pool for the selected token. Values are fee-yield estimates annualised from recent fee revenue relative to pool TVL.',
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
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
