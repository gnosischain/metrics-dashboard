const metric = {
  id: 'api_execution_circles_v2_token_count_daily',
  name: 'Distinct CRC Tokens',
  description: 'Daily count of distinct CRC tokens with non-zero supply',
  metricDescription: `Daily count of distinct Circles v2 CRC token types that have non-zero supply (the \`token_count\` column of the network total-supply model). Every minting avatar issues its own ERC-1155 token id — personal (human) tokens and group tokens — so this tracks how many distinct tokens carry a positive network supply each day, where a token's supply is derived as the negative of its zero-address balance. The current incomplete day is excluded (\`date < today()\`).`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `SELECT date, token_count AS value FROM dbt.api_execution_circles_v2_total_supply_daily`,
};

export default metric;
