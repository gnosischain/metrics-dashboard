const metric = {
  id: 'api_execution_circles_v2_p2p_velocity_daily',
  name: 'P2P Velocity',
  description: 'Peer-to-peer transfer activity per day',
  metricDescription: 'Daily peer-to-peer Circles v2 transfers — excludes mints, burns, wraps, unwraps. The cleanest "Circles velocity" series. Toggle units to flip between transfer count, distinct senders/receivers, and total amount transferred.',
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
