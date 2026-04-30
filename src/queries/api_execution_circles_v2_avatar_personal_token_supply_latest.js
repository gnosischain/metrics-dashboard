const metric = {
  id: 'api_execution_circles_v2_avatar_personal_token_supply_latest',
  name: 'Own CRC Supply',
  metricDescription: 'Total supply of the selected avatar\'s own CRC token (ERC-1155 personal token, where token_id = avatar address). Includes both unwrapped (held as ERC-1155) and wrapped (held by the avatar\'s ERC-20 wrapper contracts) circulation.',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'supply',
  format: 'formatNumber',

  query: `
    SELECT avatar, supply
    FROM dbt.api_execution_circles_v2_avatar_personal_token_supply_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
