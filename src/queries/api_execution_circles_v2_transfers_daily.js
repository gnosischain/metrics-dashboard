const metric = {
  id: 'api_execution_circles_v2_transfers_daily',
  name: 'Transfers (categorised)',
  description: 'Daily transfers by category',
  metricDescription: 'Daily Circles v2 transfer counts split into mint / burn / wrap / unwrap / p2p. (Matrix-routed p2p subdivision waits on StreamCompleted decoding.)',
  chartType: 'area',
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
