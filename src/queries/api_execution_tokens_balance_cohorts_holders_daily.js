const metric = {
  id: 'api_execution_tokens_balance_cohorts_holders_daily',
  name: 'Token Balance Cohorts (Holders)',
  description:
    'Number of holders by USD balance cohort per token',
  chartType: 'bar',
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