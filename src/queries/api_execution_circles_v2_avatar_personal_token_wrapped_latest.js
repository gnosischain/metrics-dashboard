const metric = {
  id: 'api_execution_circles_v2_avatar_personal_token_wrapped_latest',
  name: 'Wrapped (ERC-20)',
  metricDescription: 'Amount of the selected avatar\'s own CRC currently locked inside their ERC-20 wrapper contracts (demurrage + inflation). A higher share means more of the avatar\'s personal token is circulating as ERC-20 rather than native ERC-1155.',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'wrapped',
  format: 'formatNumber',
  changeData: { enabled: true, field: 'wrapped_pct', period: '% of supply' },

  query: `
    SELECT avatar, wrapped, wrapped_pct
    FROM dbt.api_execution_circles_v2_avatar_personal_token_supply_latest
  `,
};

export default metric;
