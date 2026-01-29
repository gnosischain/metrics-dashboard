const metric = {
  id: 'api_execution_tokens_balance_cohorts_value_daily',
  name: 'Token Balance Cohorts (Value)',
  description:
    'Distribution of token balances across USD buckets over time (per token).',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 90,
    end: 100,
  },
  xField: 'date',
  yField: 'value',          
  seriesField: 'label',     
  enableFiltering: true,
  labelField: 'token',      
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT
      date,
      token,
      label,
      value
    FROM dbt.api_execution_tokens_balance_cohorts_value_daily
  `,
};

export default metric;