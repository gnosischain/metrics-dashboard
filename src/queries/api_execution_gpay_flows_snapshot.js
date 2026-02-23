const metric = {
  id: 'api_execution_gpay_flows_snapshot',
  name: 'Gnosis Pay Flows',
  description: 'Flows by selected window',
  metricDescription: 'Explore directed flows between labels. Select a window and value mode, then inspect edge thickness by normalized amount or transfer count. Edge line style and color are mapped to symbol.',
  chartType: 'graph',
  enableFiltering: true,
  labelField: 'window',
  sourceIdField: 'from_label',
  sourceNameField: 'from_label',
  targetIdField: 'to_label',
  targetNameField: 'to_label',
  valueField: 'amount_usd',
  format: 'formatCurrency',
  edgeStyleField: 'symbol',
  valueModeOptions: [
    {
      key: 'amount_usd',
      label: 'Amount (USD)',
      valueField: 'amount_usd',
      format: 'formatCurrency'
    },
    {
      key: 'tf_cnt',
      label: 'Transfer Count',
      valueField: 'tf_cnt',
      format: 'formatNumber'
    }
  ],
  defaultValueMode: 'amount_usd',
  networkConfig: {
    showLabels: true,
    enableZoom: true,
    enableDrag: true,
    minNodeSize: 10,
    maxNodeSize: 44,
    minLinkThickness: 1.25,
    maxLinkThickness: 9,
    normalizeEdgeWidthToMax: true,
    parallelEdgeSeparation: 0.1,
    edgeLineTypes: ['solid', 'dashed', 'dotted', 'dashdot'],
    linkDistance: 120,
    chargeStrength: 360,
    centerStrength: 0.08
  },
  query: `
    SELECT
      window,
      symbol,
      from_label,
      to_label,
      amount_usd,
      tf_cnt
    FROM dbt.api_execution_gpay_flows_snapshot
  `
};

export default metric;
