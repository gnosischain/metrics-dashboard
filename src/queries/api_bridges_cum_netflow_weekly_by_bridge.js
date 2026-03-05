const metric = {
  id: 'api_bridges_cum_netflow_weekly_by_bridge',
  name: 'Cumulative Netflow',
  description: 'Weekly',
  metricDescription: 'Weekly cumulative netflow in USD by bridge (inflow minus outflow). Positive values indicate net inflow to Gnosis Chain.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',     
  showTotal: true,           
  smooth: true,
  showPoints: false,
  tooltipOrder: 'valueDesc',
  legend: { top: 'top', type: 'scroll' },

  query: `
    SELECT date, series, value
    FROM dbt.api_bridges_cum_netflow_weekly_by_bridge
  `,
};

export default metric;