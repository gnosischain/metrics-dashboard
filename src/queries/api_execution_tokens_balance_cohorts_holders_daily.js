const metric = {
  id: 'api_execution_tokens_balance_cohorts_holders_daily',
  name: 'Token Balance Cohorts (Holders)',
  description:
    'Number of holders by balance cohort per token',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',          
  seriesField: 'label',     
  enableFiltering: true,
  labelField: 'token',      
  unitFilterField: 'cohort_unit',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT
      date,
      token,   
      cohort_unit,
      label,   
      value  
    FROM dbt.api_execution_tokens_balance_cohorts_holders_daily
  `,
};

export default metric;
