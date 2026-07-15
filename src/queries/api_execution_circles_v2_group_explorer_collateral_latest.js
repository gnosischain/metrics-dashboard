const metric = {
  id: 'api_execution_circles_v2_group_explorer_collateral_latest',
  name: 'Collateral (CRC)',
  description: 'Member CRC locked as backing (latest)',
  metricDescription: `Total member Circles (\`CRC\`) currently locked as collateral backing this group's token, in native CRC units, taken as the sum across all backing token ids at the latest available collateral snapshot date. Score-based groups mint against an on-chain score rather than locked collateral, so this reads \`0\` for them.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT collateral_total AS value
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
