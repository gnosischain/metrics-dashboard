const metric = {
  id: 'api_bridges_sankey_gnosis_in_by_token_7d',
  name: 'Token Flows: Gnosis Inbound',
  description: 'Inbound Flows by Token(last 7 days)',
  metricDescription: 'Token-level inbound bridge flows into Gnosis over the last 7 days. Link width represents USD volume for each source-chain and token path.',
  chartType: 'sankey',
  format: 'formatCurrency',
  enableFiltering: true,
  labelField: 'token',
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
    SELECT token, source, target, value
    FROM dbt.api_bridges_sankey_gnosis_in_by_token_7d
  `,
};
export default metric;