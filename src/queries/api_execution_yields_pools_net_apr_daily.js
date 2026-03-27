const metric = {
  id: 'api_execution_yields_pools_net_apr_daily',
  name: 'Net APR',
  description: '7-day trailing by pool',
  metricDescription: `Net APR by pool for the selected token.

- **Net APR** (solid) — what LPs actually earn: fees minus LVR, annualised
- **Fee APR** (dashed) — gross fee revenue earned by the pool, annualised
- **LVR** (dashed) — Loss Versus Rebalancing: the cost of arbitrage rebalancing, annualised (negative = loss)

All values use a 7-day trailing window. LVR is a pool-level estimate derived from aggregate swap flows, not from individual LP position tracking.`,
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
    { field: 'lvr_apr_7d', label: 'LVR' }
  ],
  seriesStyleMap: {
    'Net APR': { color: '#91cc75', lineStyle: { width: 2.5 } },
    'Fee APR': { color: '#5470c6', lineStyle: { type: 'dashed', opacity: 0.55, width: 1.5 }, symbolSize: 0 },
    'LVR':     { color: '#ee6666', lineStyle: { type: 'dashed', opacity: 0.55, width: 1.5 }, symbolSize: 0 }
  },
  query: `
    SELECT
      date,
      token,
      label AS pool,
      net_apr_7d,
      fee_apr_7d,
      lvr_apr_7d
    FROM dbt.api_execution_yields_pools_net_apr_daily
    ORDER BY date ASC, token, pool
  `,
};

export default metric;
