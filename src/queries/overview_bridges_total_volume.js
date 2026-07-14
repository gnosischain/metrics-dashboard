const metric = {
  id: 'overview_bridges_total_volume',
  name: 'Bridge Volume (All-Time)',
  valueField: 'value',
  chartType: 'number',
  format: 'formatCurrencyCompact',
  metricDescription: 'Cumulative all-time volume bridged into and out of Gnosis Chain.',
  query: `SELECT value FROM dbt.api_bridges_kpi_total_volume_all_time`
};

export default metric;
