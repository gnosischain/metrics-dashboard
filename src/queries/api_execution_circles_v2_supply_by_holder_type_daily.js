const metric = {
  id: 'api_execution_circles_v2_supply_by_holder_type_daily',
  name: 'Supply by Holder Type',
  description: 'Daily CRC supply broken down by holder category',
  metricDescription: `Daily CRC supply split by the category of the address holding it. Each holder is labelled by its Circles avatar type (\`Human\`, \`Group\`, \`Organization\`) when it is a registered avatar; otherwise by a crawler/Dune-style label \`project\` (e.g. \`DEX\`, \`Wallets and AA\`); otherwise \`Other\`. Values sum positive balances only — the zero address and any zero/negative balances are excluded — in CRC. Toggle **Static** (nominal \`supply\`) vs **Demurraged** (demurrage-adjusted \`demurraged_supply\`); the current incomplete day is excluded.`,
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
