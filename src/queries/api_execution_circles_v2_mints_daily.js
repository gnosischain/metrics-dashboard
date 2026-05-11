const metric = {
  id: 'api_execution_circles_v2_mints_daily',
  name: 'Daily Mints',
  description: 'Mints per day: events, minters, volume',
  metricDescription: 'Network-level Circles v2 personal-mint summary by day: count of mint events, distinct minting avatars, and total CRC minted. Toggle the unit to flip between event count and volume.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_mint_events',
  seriesField: 'series',
  unitFields: {
    events:  { field: 'n_mint_events', format: 'formatNumber' },
    minters: { field: 'n_minters',     format: 'formatNumber' },
    volume:  { field: 'amount_minted', format: 'formatNumber' },
  },
  query: `
    SELECT
      date,
      n_mint_events,
      n_minters,
      amount_minted
    FROM dbt.api_execution_circles_v2_mints_daily
    ORDER BY date
  `,
};
export default metric;
