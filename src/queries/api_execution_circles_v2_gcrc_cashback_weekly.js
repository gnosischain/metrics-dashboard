const metric = {
  id: 'api_execution_circles_v2_gcrc_cashback_weekly',
  name: 'Weekly gCRC Cashback',
  description: 'gCRC distributed and recipients per week',
  metricDescription: `Weekly volume of Circles gCRC cashback paid to active app users, with a toggle between total \`gCRC\` distributed and the count of distinct recipients (\`n_recipients\`). gCRC is the ERC-20 wrapper of the Gnosis group-Circles avatar, and only transfers from the program's dedicated cashback wallet are counted; an address qualifies as a recipient in a week only if it received **at least 1 gCRC** that week (smaller dust amounts are excluded). This is a separate program from the gPay cashback and the two are not combined. Grain is weekly (ISO week starting Monday) and the current, still-incomplete week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'amount',
  format: 'formatNumberCompact',
  valueModeOptions: [
    { key: 'amount',       label: 'gCRC',       valueField: 'amount',       format: 'formatNumberCompact' },
    { key: 'n_recipients', label: 'Recipients', valueField: 'n_recipients', format: 'formatNumber' },
  ],
  query: `
    SELECT week AS date, amount, n_recipients
    FROM dbt.api_execution_circles_v2_gcrc_cashback_weekly
    ORDER BY week
  `,
};
export default metric;
