const metric = {
  id: 'api_execution_tokens_balance_cohorts_value_daily',
  name: 'Token Balance Cohorts (Value)',
  description:
    'Value held by balance cohort per token',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value_native',          
  seriesField: 'label',     
  enableFiltering: true,
  labelField: 'token',      
  unitFilterField: 'cohort_unit',
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
      cohort_unit,
      label,   
      value_native,
      value_usd
    FROM dbt.api_execution_tokens_balance_cohorts_value_daily
  `,
};

export default metric;
