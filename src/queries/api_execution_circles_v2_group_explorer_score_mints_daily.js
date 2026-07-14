const metric = {
  id: 'api_execution_circles_v2_group_explorer_score_mints_daily',
  name: 'Score Mints (daily)',
  description: 'Daily score-based minting activity',
  metricDescription: `Daily score-based minting for the group. The default series **Avg score** is the mean member trust score at mint each day; toggle **Mints** (number of \`PersonalMinted\` events), **Minters** (distinct minters), or **Amount** (group tokens minted, CRC). Only groups minting through the \`OffchainScoreBasedMintPolicy\` populate this chart. The current incomplete day is excluded.`,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  globalFilterField: 'group_address',
  xField: 'date',
  yField: 'avg_score',
  format: 'formatNumber',
  valueModeOptions: [
    { key: 'avg_score', label: 'Avg score',    valueField: 'avg_score', format: 'formatNumber' },
    { key: 'n_mints',   label: 'Mints',        valueField: 'n_mints',   format: 'formatNumber' },
    { key: 'n_minters', label: 'Minters',      valueField: 'n_minters', format: 'formatNumber' },
    { key: 'amount',    label: 'Amount (CRC)', valueField: 'amount',    format: 'formatNumberCompact' },
  ],
  defaultValueMode: 'avg_score',
  query: `
    SELECT date, n_mints, n_minters, avg_score, round(amount, 2) AS amount
    FROM dbt.api_execution_circles_v2_score_mints_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};
export default metric;
