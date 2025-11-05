const metric = {
  id: 'api_bridges_sankey_gnosis_out_ranges',
  name: 'Bridge Flow (Gnosis → Bridge → Others)',
  description: 'Select range',
  chartType: 'sankey',
  format: 'formatCurrency',
  enableFiltering: true,
  labelField: 'range',     
  sourceField: 'source',
  targetField: 'target',
  valueField: 'value',
  sankeyConfig: {
    nodeWidth: 16,
    nodeGap: 12,
    orient: 'horizontal',
    showNodeTotals: true
  },
  query: `
    SELECT range, source, target, value
    FROM playground_max.api_bridges_sankey_gnosis_out_ranges
  `,
};

export default metric;