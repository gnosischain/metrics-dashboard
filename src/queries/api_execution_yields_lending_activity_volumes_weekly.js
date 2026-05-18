const metric = {
  id: 'api_execution_yields_lending_activity_volumes_weekly',
  name: 'Deposit & Borrow Volume',
  description: 'Weekly in USD',
  metricDescription: 'Weekly deposit and borrow volumes across Gnosis lending markets (Aave V3 and SparkLend) by token. Use token + protocol filters to isolate specific capital flows.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'volume_type',
  enableFiltering: true,
  labelField: 'token',
  globalFilterField: 'token',
  applySecondaryGlobalFilter: true,
  format: 'formatValue',
  tooltipOrder: 'valueDesc',
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],
  barOpacity: 0.8,
  query: `
    SELECT date, token, token_class, label AS protocol, volume_type, value
    FROM dbt.api_execution_lending_activity_volumes_weekly
  `,
};

export default metric;
