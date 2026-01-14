const metric = {
  id: 'api_execution_yields_lending_activity_volumes_weekly',
  name: 'Aave V3 Deposits & Borrows Volume',
  description: 'Weekly deposit and borrow volume',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 60,
    end: 100,
  },
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
