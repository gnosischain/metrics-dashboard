const metric = {
  id: 'api_execution_circles_v2_kpi_gcrc_cashback_total',
  name: 'Total gCRC Cashback',
  description: 'Lifetime · complete weeks (gCRC)',
  metricDescription: `**Lifetime (gCRC).** Total \`gCRC\` distributed by the Circles cashback wallet to active app users across all complete weeks since the program began (Dec 2025). \`gCRC\` is the ERC-20-wrapped Gnosis group Circles token (18 decimals); only per-week, per-address amounts of **≥ 1 gCRC** are included, so sub-1-gCRC dust is excluded. Distinct from the Gnosis Pay gCRC/USD cashback program — the two are not combined. The current incomplete week is excluded.`,
  chartType: 'numberDisplay',
  format: 'formatNumberCompact',
  valueField: 'value',
  query: `SELECT total_amount AS value FROM dbt.api_execution_circles_v2_gcrc_cashback_total`,
};
export default metric;
