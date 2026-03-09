const metric = {
  id: 'api_execution_yields_pools_net_apr_daily',
  name: 'Pool Net APR',
  description: '7-day trailing net APR by pool',
  metricDescription: '7-day trailing net APR (fee revenue minus estimated impermanent loss) by pool for the selected token. Solid line is net APR, dashed lines show gross fee APR and IL breakdown. IL uses the constant-product model as a lower bound.',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'net_apr_7d',
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
  multiYFields: [
    { field: 'net_apr_7d', label: 'Net APR' },
    { field: 'fee_apr_7d', label: 'Fee APR' },
    { field: 'il_apr_7d', label: 'IL' }
  ],
  seriesStyleMap: {
    'Net APR': { color: '#91cc75', lineStyle: { width: 2.5 } },
    'Fee APR': { color: '#5470c6', lineStyle: { type: 'dashed', opacity: 0.55, width: 1.5 }, symbolSize: 0 },
    'IL':      { color: '#ee6666', lineStyle: { type: 'dashed', opacity: 0.55, width: 1.5 }, symbolSize: 0 }
  },
  query: `
    SELECT
      date,
      token,
      label AS pool,
      net_apr_7d,
      fee_apr_7d,
      il_apr_7d
    FROM dbt.api_execution_yields_pools_net_apr_daily
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
