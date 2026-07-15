const metric = {
  id: 'api_execution_circles_v2_transfers_daily',
  name: 'Transfers (categorised)',
  description: 'Daily transfers by category',
  metricDescription: `Daily Circles v2 transfer counts split by \`transfer_category\`: \`mint\` (Hub ERC-1155 \`TransferSingle\` from the zero address), \`burn\` (\`TransferSingle\` to the zero address), \`wrap\` (wrapper ERC-20 \`Transfer\` from the zero address), \`unwrap\` (wrapper \`Transfer\` to the zero address), and \`p2p\` (every other transfer). Each transfer is counted once and assigned exactly one category; the chart plots \`n_transfers\` per category per day. The current incomplete day is excluded, and \`p2p\` is not yet subdivided into direct vs matrix-routed transfers (pending \`StreamCompleted\` decoding).`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_transfers',
  seriesField: 'transfer_category',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT date, transfer_category, n_transfers
    FROM dbt.api_execution_circles_v2_transfers_daily
    ORDER BY date
  `,
};
export default metric;
