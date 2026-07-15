const metric = {
  id: 'api_execution_circles_v2_kpi_gcrc_cashback_last_week',
  name: 'Cashback (last week)',
  description: 'Most recent complete week (gCRC)',
  metricDescription: `**Most recent complete week.** Total \`gCRC\` cashback paid out that week — the sum of \`gCRC\` sent from the Circles cashback wallet to active app users. \`gCRC\` is the ERC-20 wrapper of the Gnosis group Circles avatar (18 decimals). Only addresses that received **≥ 1 gCRC** from the wallet in the week count toward the total (threshold applied per \`(week, address)\`, matching the Dune circles-v2-kpis dashboard); sub-1-gCRC dust is excluded. Separate from the Gnosis Pay gCRC cashback program (not combined). The current, still-incomplete week is excluded.`,
  chartType: 'numberDisplay',
  format: 'formatNumberCompact',
  valueField: 'value',
  query: `SELECT amount AS value FROM dbt.api_execution_circles_v2_gcrc_cashback_weekly ORDER BY week DESC LIMIT 1`,
};
export default metric;
