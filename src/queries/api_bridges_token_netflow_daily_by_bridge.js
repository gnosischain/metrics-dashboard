const metric = {
  id: 'api_bridges_token_netflow_daily_by_bridge',
  name: 'Daily Token Netflow',
  description: 'Daily Netflow per Token by Bridge',
  metricDescription: 'Daily net token flow in USD by bridge and token. Negative values mean net outflow from Gnosis for that token on that day.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 90, 
    end: 100   
  },
  stacked: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'token',  
  enableFiltering: true,
  labelField: 'bridge',
  format: 'formatCurrency',
  barWidth: 'auto',
  barMaxWidth: 40,
  borderRadius: [2, 2, 0, 0],
  tooltipOrder: 'valueDesc',

  query: `
    SELECT date, bridge, token, value
    FROM dbt.api_bridges_token_netflow_daily_by_bridge
  `,
};

export default metric;