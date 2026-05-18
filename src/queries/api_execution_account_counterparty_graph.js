const metric = {
  id: 'api_execution_account_counterparty_graph',
  name: 'Counterparty Graph',
  description: 'Directed account interaction graph by transfers and production-backed relationships',
  chartType: 'graph',
  globalFilterField: 'address',
  sourceIdField: 'source',
  sourceNameField: 'source_name',
  targetIdField: 'target',
  targetNameField: 'target_name',
  valueField: 'weight',
  edgeStyleField: 'edge_type',
  format: 'formatNumber',
  networkConfig: {
    showLabels: false,
    enableZoom: true,
    enableDrag: true,
    highlightConnectedNodes: true,
    minNodeSize: 10,
    maxNodeSize: 42,
    minLinkThickness: 1,
    maxLinkThickness: 5,
    normalizeEdgeWidthToMax: true,
    showArrows: true,
    linkCurveness: 0.16,
    parallelEdgeSeparation: 0.1,
    linkDistance: 120,
    chargeStrength: 360,
    centerStrength: 0.08,
  },
  query: `
    SELECT
      source,
      target,
      source_name,
      target_name,
      edge_type,
      weight,
      raw_volume,
      last_seen_date
    FROM dbt.api_execution_account_counterparty_graph
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY weight DESC
    LIMIT 60
  `,
};

export default metric;
