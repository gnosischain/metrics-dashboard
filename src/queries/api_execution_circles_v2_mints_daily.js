const metric = {
  id: 'api_execution_circles_v2_mints_daily',
  name: 'Daily Mints',
  description: 'Mints per day: events, minters, volume',
  metricDescription: `Per-day Circles v2 mint activity: number of mint events, distinct minting (recipient) addresses, and total CRC minted (raw amount / 1e18). Mints span all kinds classified by \`mint_kind\` — \`personal\` (a human's hourly personal-CRC issuance, from \`PersonalMint\` events), \`group\` (\`GroupMint\`), and \`migration\` (V1→V2 migration legs) — this card is **not** restricted to personal mints. Switch the unit selector between event count, distinct minters, and CRC volume. The current (incomplete) day is excluded.`,
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
