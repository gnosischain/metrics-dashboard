const metric = {
  id: 'api_execution_circles_v2_kpi_gcrc_cashback_last_week_recipients',
  name: 'Recipients (last week)',
  metricDescription: `**Most recent complete week.** Count of distinct addresses that received **≥ 1 gCRC** of Circles cashback from the cashback wallet during that week. \`gCRC\` is the ERC-20 wrapper of the Gnosis group Circles avatar; the ≥ 1 gCRC threshold is applied per address per week (matching the Dune circles-v2-kpis dashboard), so addresses receiving only dust are excluded. Separate from the Gnosis Pay gCRC cashback program. The current incomplete week is excluded.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT n_recipients AS value FROM dbt.api_execution_circles_v2_gcrc_cashback_weekly ORDER BY week DESC LIMIT 1`,
};
export default metric;
