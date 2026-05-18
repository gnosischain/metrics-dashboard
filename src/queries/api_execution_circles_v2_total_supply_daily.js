const metric = {
  id: 'api_execution_circles_v2_total_supply_daily',
  name: 'Total CRC Supply',
  description: 'Network-wide CRC supply (nominal and demurraged)',
  metricDescription: 'Daily total CRC supply across all Circles v2 tokens. Toggle between static and demurrage-adjusted values.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',

  // Unit toggle between static and demurraged supply
  unitFields: {
    static:     { field: 'value',            format: 'formatNumber', label: 'Static' },
    demurraged: { field: 'value_demurraged', format: 'formatNumber', label: 'Demurraged' },
  },

  query: `SELECT date, value, value_demurraged FROM dbt.api_execution_circles_v2_total_supply_daily`,
};

export default metric;
