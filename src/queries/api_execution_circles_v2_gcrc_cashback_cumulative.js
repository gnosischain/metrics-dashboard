const metric = {
  id: 'api_execution_circles_v2_gcrc_cashback_cumulative',
  name: 'Cumulative gCRC Cashback',
  description: 'Total gCRC distributed and lifetime recipients',
  metricDescription: `**Cumulative Circles gCRC cashback.** Running weekly total of \`gCRC\` paid out by the cashback program and the running count of distinct lifetime recipients (each recipient counted in the week they first received cashback). \`gCRC\` is the ERC-20 wrapper of the gCRC group-token avatar; a wallet counts as a recipient in a week only if it received **≥ 1 gCRC** from the cashback wallet (\`0x7abe…af6a\`) that week, so sub-1 gCRC dust weeks are excluded. Amounts are summed from wrapper-token transfers (raw / 1e18) across both gCRC token contracts spanning the mid-2026 token cutover. Weekly (Monday-aligned) grain; the current incomplete week is excluded. Toggle the series between total \`gCRC\` and \`Recipients\`.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'cumulative_amount',
  format: 'formatNumberCompact',
  valueModeOptions: [
    { key: 'cumulative_amount',     label: 'gCRC',       valueField: 'cumulative_amount',     format: 'formatNumberCompact' },
    { key: 'cumulative_recipients', label: 'Recipients', valueField: 'cumulative_recipients', format: 'formatNumber' },
  ],
  query: `
    SELECT week AS date, cumulative_amount, cumulative_recipients
    FROM dbt.api_execution_circles_v2_gcrc_cashback_cumulative
    ORDER BY week
  `,
};
export default metric;
