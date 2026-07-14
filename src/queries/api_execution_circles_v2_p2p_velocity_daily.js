const metric = {
  id: 'api_execution_circles_v2_p2p_velocity_daily',
  name: 'P2P Velocity',
  description: 'Peer-to-peer transfer activity per day',
  metricDescription: `Daily peer-to-peer Circles v2 transfer activity. **p2p** is the residual \`transfer_category\` — every transfer that is *not* a \`mint\`, \`burn\`, \`wrap\`, or \`unwrap\` (i.e. neither the \`from\` nor the \`to\` side is the zero address). Toggle units between \`n_transfers\` (transfer count), \`n_senders\` / \`n_receivers\` (distinct addresses active that day), and \`amount\` (total CRC moved, raw / 1e18, nominal — not demurrage-adjusted). The current incomplete day is excluded; p2p is not yet subdivided into direct vs matrix-routed transfers (pending \`StreamCompleted\` decoding).`,
  chartType: 'line',
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
