const metric = {
  id: 'api_execution_circles_v2_supply_by_holder_type_daily',
  name: 'Supply by Holder Type',
  description: 'Daily CRC supply broken down by holder category',
  metricDescription: 'Daily CRC supply broken down by holder type. Categories include avatar types (Human, Group, Org) and Dune-labelled sectors such as DEXes, wallets, and AA accounts.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  enableFiltering: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  labelField: 'label',
  tooltipOrder: 'valueDesc',
  legend: { top: 'top', type: 'scroll' },

  unitFields: {
    static:     { field: 'value',            format: 'formatNumber', label: 'Static' },
    demurraged: { field: 'value_demurraged', format: 'formatNumber', label: 'Demurraged' },
  },

  query: `SELECT date, label, value, value_demurraged FROM dbt.api_execution_circles_v2_supply_by_holder_type_daily`,
};

export default metric;
