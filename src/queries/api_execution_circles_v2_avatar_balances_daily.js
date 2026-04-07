const metric = {
  id: 'api_execution_circles_v2_avatar_balances_daily',
  name: 'Balance History by Token',
  description: 'Daily CRC balance held per token',
  metricDescription: 'Daily CRC balance for the selected avatar, broken down by Circles token. Toggle between static and demurrage-adjusted values.',
  chartType: 'area',
  globalFilterField: 'avatar',
  isTimeSeries: true,
  enableZoom: true,
  stacked: true,
  showTotal: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'balance',
  seriesField: 'token_address',
  legend: { top: 'top', type: 'scroll' },
  tooltipOrder: 'valueDesc',

  unitFields: {
    static:     { field: 'balance',            format: 'formatNumber', label: 'Static' },
    demurraged: { field: 'balance_demurraged', format: 'formatNumber', label: 'Demurraged' },
  },

  query: `
    SELECT avatar, date, token_address, balance, balance_demurraged
    FROM dbt.api_execution_circles_v2_avatar_balances_daily
  `,
};

export default metric;
