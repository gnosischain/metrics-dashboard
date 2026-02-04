const metric = {
  id: 'api_execution_tokens_supply_by_class_daily',
  name: 'Token Supply Over Time',
  description: 'Daily token supply (market cap) by token within class.',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100,
  },
  xField: 'date',
  yField: 'value_usd',
  seriesField: 'token',        
  enableFiltering: true,
  labelField: 'token_class',   
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',

  query: `
    SELECT
      date,
      token,
      token_class,
      value_usd
    FROM dbt.api_execution_tokens_supply_daily
  `,
};

export default metric;
