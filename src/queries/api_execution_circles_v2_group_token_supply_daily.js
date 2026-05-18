const metric = {
  id: 'api_execution_circles_v2_group_token_supply_daily',
  name: 'Group Token Supply',
  description: 'Native ERC-1155 vs wrapped ERC-20 supply across all groups',
  metricDescription: `**Daily aggregate supply of Circles v2 group personal tokens**, stacked by where the supply lives:

- \`ERC-1155 (native)\` — held as the native ERC-1155 personal token.
- \`ERC-20 (wrapped)\` — held as the ERC-20 wrapper deployed via ERC20Lift.

Resolution: a \`token_address\` is mapped to its issuer avatar via the wrapper registry (\`int_execution_circles_v2_wrappers\`); ERC-1155 native ids equal the issuer avatar address. We then filter to issuers with \`avatar_type = 'Group'\`.

Note: the two series are additive only in the on-chain sense — the wrapper contract holds an equal amount of native tokens for every wrapped token it issues.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  showTotal: true,
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.5,
  query: `
    SELECT date, label, value, value_demurraged
    FROM dbt.api_execution_circles_v2_group_token_supply_daily
    ORDER BY date, label
  `,
};
export default metric;
