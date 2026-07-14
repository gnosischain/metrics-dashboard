const metric = {
  id: 'api_execution_circles_v2_group_explorer_mints_redemptions_daily',
  name: 'Mints vs Redemptions (daily)',
  metricDescription: `Daily comparison of group-token **mints** vs collateral **redemptions**. \`Mints (group CRC)\` = group tokens issued (\`group\`-kind mint events); \`Redemptions (collateral CRC)\` = member/collateral CRC burned or returned when holders redeem (\`GroupRedeemCollateralBurn\` + \`GroupRedeemCollateralReturn\`). The two series are **different tokens/units** and do not net against each other. The current (incomplete) day is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  globalFilterField: 'group_address',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  format: 'formatNumber',
  query: `
    SELECT date, kind AS label, amount AS value
    FROM dbt.api_execution_circles_v2_group_mints_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date, label
  `,
};
export default metric;
