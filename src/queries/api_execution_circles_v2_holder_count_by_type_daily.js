const metric = {
  id: 'api_execution_circles_v2_holder_count_by_type_daily',
  name: 'Holders by Type',
  description: 'Daily distinct holder count per category',
  metricDescription: `Daily number of distinct addresses holding a positive CRC balance, split by holder category. **Counted:** accounts with a non-zero balance that day (the zero burn address is excluded), each labelled once by coalescing its Circles avatar type (\`Human\`, \`Group\`, \`Org\`) first, then a crawler/Dune project sector (e.g. \`DEX\`, \`Wallets and AA\`), else \`Other\`. This is a holder head-count (\`holder_count\`), not supply, so every address falls into exactly one category. Daily grain; the current incomplete day is excluded.`,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  enableFiltering: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  labelField: 'label',
  legend: { top: 'top', type: 'scroll' },
  query: `SELECT date, label, holder_count AS value FROM dbt.api_execution_circles_v2_supply_by_holder_type_daily`,
};

export default metric;
