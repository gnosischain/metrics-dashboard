const metric = {
  id: 'api_execution_circles_v2_avatar_holdings_by_token',
  name: 'Holdings by Token',
  description: 'CRC tokens held by the avatar',
  metricDescription: 'Demurrage-adjusted balance of each Circles v2 token held by the selected avatar.',
  chartType: 'bar',
  globalFilterField: 'avatar',
  isTimeSeries: false,
  format: 'formatNumber',
  xField: 'token_address',
  yField: 'balance_demurraged',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  query: `
    SELECT avatar, token_address, balance, balance_demurraged
    FROM dbt.api_execution_circles_v2_avatar_balances_latest
  `,
};

export default metric;
