const metric = {
  id: 'api_execution_circles_v2_p2p_velocity_daily',
  name: 'Peer-to-Peer Transfers',
  description: 'Daily wallet-to-wallet CRC activity',
  metricDescription: `Daily count and volume of genuine wallet-to-wallet Circles v2 transfers. **p2p** is the residual \`transfer_category\`: every transfer where **both** sides are real wallets — it excludes protocol supply events (**mint** = from the zero address, **burn** = to the zero address) and ERC-20 **wrap**/**unwrap** conversions. Toggle the measure between \`n_transfers\` (transfer count), \`n_senders\` / \`n_receivers\` (distinct wallets active that day), and \`amount\` (total CRC moved, raw / 1e18, nominal — not demurrage-adjusted). The current incomplete day is excluded; p2p is not yet subdivided into direct vs matrix-routed transfers (pending \`StreamCompleted\` decoding).`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_transfers',
  unitFields: {
    transfers: { field: 'n_transfers', format: 'formatNumber' },
    senders:   { field: 'n_senders',   format: 'formatNumber' },
    receivers: { field: 'n_receivers', format: 'formatNumber' },
    amount:    { field: 'amount',      format: 'formatNumber' },
  },
  query: `
    SELECT date, n_transfers, n_senders, n_receivers, amount
    FROM dbt.api_execution_circles_v2_p2p_velocity_daily
    ORDER BY date
  `,
};
export default metric;
