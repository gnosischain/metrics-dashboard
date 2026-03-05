const metric = {
  id: 'api_bridges_sankey_gnosis_out_ranges',
  name: 'Bridge Flows: Gnosis Outbound',
  description: 'Total outbound flows by period',
  metricDescription: 'Outbound bridge flows from Gnosis split by selected time window. Use the range filter to compare route composition across periods.',
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
    showNodeTotals: false,
    top: 28 
  },
  query: `
    SELECT range, source, target, value
    FROM dbt.api_bridges_sankey_gnosis_out_ranges
  `,
};

export default metric;