const metric = {
  id: 'api_execution_circles_v2_kpi_gcrc_cashback_recipients',
  name: 'Cashback Recipients',
  metricDescription: `**Lifetime.** Number of distinct addresses (\`uniqExact\`) that received **≥ 1 gCRC** of Circles cashback in at least one complete week since the program began. \`gCRC\` is the ERC-20 wrapper of the Gnosis group Circles avatar; the ≥ 1 gCRC threshold is applied per address per week, and each address is counted once regardless of how many weeks it earned. Excludes the current incomplete week and is separate from the Gnosis Pay gCRC cashback program.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT total_recipients AS value FROM dbt.api_execution_circles_v2_gcrc_cashback_total`,
};
export default metric;
