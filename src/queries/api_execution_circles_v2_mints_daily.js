const metric = {
  id: 'api_execution_circles_v2_mints_daily',
  name: 'Daily Mints',
  description: 'Mints per day: events, minters, volume',
  metricDescription: `Per-day Circles v2 mint activity: number of mint events, minting (recipient) addresses, and total CRC minted (raw amount / 1e18), totalled across all mint kinds. Mints span all kinds classified by \`mint_kind\` — \`personal\` (a human's hourly personal-CRC issuance, from \`PersonalMint\` events), \`group\` (\`GroupMint\`), and \`migration\` (V1→V2 migration legs) — this card is **not** restricted to personal mints. The daily total sums the per-kind rows, so the minter count is summed across kinds (an avatar active in more than one kind is counted once per kind). Switch the unit selector between event count, minters, and CRC volume. The current (incomplete) day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_mint_events',
  unitFields: {
    events:  { field: 'n_mint_events', format: 'formatNumber' },
    minters: { field: 'n_minters',     format: 'formatNumber' },
    volume:  { field: 'amount_minted', format: 'formatNumber' },
  },
  query: `
    SELECT
      date,
      sum(n_mint_events) AS n_mint_events,
      sum(n_minters)     AS n_minters,
      sum(amount_minted) AS amount_minted
    FROM dbt.api_execution_circles_v2_mints_daily
    GROUP BY date
    ORDER BY date
  `,
};
export default metric;
