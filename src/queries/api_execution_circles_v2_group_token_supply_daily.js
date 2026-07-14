const metric = {
  id: 'api_execution_circles_v2_group_token_supply_daily',
  name: 'Group Token Supply (daily)',
  description: 'Native ERC-1155 vs wrapped ERC-20 supply across all groups',
  metricDescription: `**Daily circulating supply of all Circles v2 group personal tokens**, in CRC, stacked by the form the supply is held in:

- \`ERC-1155 (native)\` — supply held as the native Circles ERC-1155 personal token.
- \`ERC-20 (wrapped)\` — supply held via the ERC-20 wrapper deployed through ERC20Lift.

Only tokens whose issuer avatar has \`avatar_type = 'Group'\` are counted; a \`token_address\` is mapped to its issuer via the wrapper registry (\`int_execution_circles_v2_wrappers\`), and native ERC-1155 ids equal the issuer avatar address. Figures are raw (non-demurraged) CRC and the current incomplete day is excluded. Caveat: the two series are additive only on-chain — native supply also includes the ERC-1155 tokens that wrapper contracts hold as 1:1 backing for the ERC-20 wrapped supply, so the stacked total counts the wrapped amount on both sides.`,
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
