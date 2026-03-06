const metric = {
  id: 'api_execution_yields_lending_activity_volumes_weekly',
  name: 'Deposit & Borrow Volume',
  description: 'Weekly in USD',
  metricDescription: 'Weekly deposit and borrow volumes on Aave V3 by token. Use the token filter to compare capital-flow direction.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'volume_type',
  enableFiltering: true,
  labelField: 'token',
  format: 'formatValue',
  tooltipOrder: 'valueDesc',
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.8,
  query: `SELECT * FROM dbt.api_execution_yields_lending_activity_volumes_weekly`,
};

export default metric;
