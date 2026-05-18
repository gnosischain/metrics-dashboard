const metric = {
  id: 'overview_bridges_total_volume',
  name: 'Bridge Volume (All-Time)',
  valueField: 'value',
  chartType: 'number',
  format: null,
  fontSize: '2.6rem',
  query: `SELECT CONCAT('+$',toString(floor(value/1000000)), 'M') AS value FROM dbt.api_bridges_kpi_total_volume_all_time`
};

export default metric;
