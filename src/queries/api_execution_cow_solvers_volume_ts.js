const metric = {
  id: 'api_execution_cow_solvers_volume_ts',
  name: 'Volume by Solver',
  description: 'Daily USD volume split by solver',
  metricDescription: 'Daily trading volume attributed to each solver, based on which solver settled the batch containing each trade. Top 6 solvers by recent (180d) volume are shown individually with their CoW Explorer name when known (or a truncated address otherwise); all others are grouped as "Other".',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatCurrencyCompact',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  smooth: true,
  symbolSize: 0,
  lineWidth: 1,
  areaOpacity: 0.75,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_cow_solvers_volume_ts`,
};
export default metric;
