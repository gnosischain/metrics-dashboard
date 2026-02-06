const metric = {
  id: 'api_execution_tokens_supply_daily',
  name: 'Token Supply',
  description: 'Daily circulating supply per token (excluding burn address).',
  chartType: 'area',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value_native',
  // We use labelField so the generic dropdown component
  // lets you pick the token
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',

  // Unit toggle support (Native/USD)
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber' },
    usd: { field: 'value_usd', format: 'formatCurrency' }
  },

  query: `
    SELECT
      date,
      token,
      value_native,
      value_usd
    FROM dbt.api_execution_tokens_supply_daily
  `,
};

export default metric;