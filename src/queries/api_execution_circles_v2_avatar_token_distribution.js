const metric = {
  id: 'api_execution_circles_v2_avatar_token_distribution',
  name: 'Token Distribution',
  description: 'Where the avatar\'s personal CRC token currently lives',
  metricDescription: 'For the selected Circles v2 avatar\'s OWN personal CRC token (the ERC-1155 whose token_address equals the avatar address), where the supply currently sits. Holders are bucketed into:\n\n- **Self** — held by the avatar themselves\n- **Wrapped (ERC-20)** — held inside an ERC20Lift wrapper contract registered for this avatar\n- **Other Circles avatars** — held by other registered Circles avatars (transitively trusted humans, groups, organisations)\n- **Other contracts** — anything else (DEX pools, custodians, multisigs, etc.)\n\nValues are demurrage-adjusted CRC, filtered to balances above 0.001 CRC.',
  chartType: 'pie',
  globalFilterField: 'avatar',
  format: 'formatNumber',
  nameField: 'holder_category',
  valueField: 'balance_demurraged',
  showTotal: true,
  legend: { type: 'scroll' },
  tooltipOrder: 'valueDesc',

  query: `
    SELECT avatar, holder_category, holder_count, balance, balance_demurraged
    FROM dbt.api_execution_circles_v2_avatar_token_distribution
  `,
};

export default metric;
