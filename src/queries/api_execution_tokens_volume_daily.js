const metric = {
  id: 'api_execution_tokens_volume_daily',
  name: 'Transfer Volume',
  description: 'Daily transfer volume per token',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value_native',
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
    FROM dbt.api_execution_tokens_volume_daily
  `,
};

export default metric;
