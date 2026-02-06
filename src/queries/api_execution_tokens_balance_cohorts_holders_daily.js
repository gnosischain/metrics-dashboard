const metric = {
  id: 'api_execution_tokens_balance_cohorts_holders_daily',
  name: 'Token Balance Cohorts (Holders)',
  description:
    'Number of holders per USD balance bucket over time (per token).',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',          
  seriesField: 'label',     
  enableFiltering: true,
  labelField: 'token',      
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT
      date,
      token,
      label,
      value
    FROM dbt.api_execution_tokens_balance_cohorts_holders_daily
  `,
};

export default metric;