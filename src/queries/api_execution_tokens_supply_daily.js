const metric = {
  id: 'api_execution_tokens_supply_daily',
  name: 'Supply',
  description: 'Daily total supply per token',
  chartType: 'area',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value_native',
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
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