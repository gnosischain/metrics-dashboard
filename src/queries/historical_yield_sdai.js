const metric = {
  id: 'historical_yield_sdai',
  name: 'Savings xDAI APY',
  description: 'APY for Savings xDAI (formerly sDAI) on rolling Moving Median (MM)',
  metricDescription:
    'Historical APY for the Savings xDAI vault (0xaf20…3701) on Gnosis Chain. ' +
    'Before 2025-11-07 the vault was backed by bridged DAI earning the Sky DSR ' +
    'relayed from Mainnet (sDAI). After 2025-11-07 18:07:25 UTC the xDAI bridge ' +
    'was upgraded to deposit into Sky sUSDS; the vault continues to operate at ' +
    'the same address but now accrues USDS yield. Legacy label "sDAI" is ' +
    'retained as an alias for dashboard-URL compatibility.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',

  defaultZoom: {
    start: 70,
    end: 100
  },

  xField: 'date',
  yField: 'apy',
  seriesField: 'label',

  smooth: true,
  symbolSize: 4,
  lineWidth: 2,

  markLine: {
    symbol: 'none',
    silent: false,
    label: {
      formatter: 'USDS migration',
      position: 'middle',
      color: '#888',
      fontSize: 11,
    },
    lineStyle: { type: 'dashed', color: '#888', width: 1 },
    data: [{ xAxis: '2025-11-07' }],
  },

  query: `SELECT date, apy, label FROM dbt.fct_yields_savings_xdai_apy_daily`,
};

export default metric;
