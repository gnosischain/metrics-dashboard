const metric = {
  id: 'api_execution_tokens_supply_by_class_daily',
  name: 'Token Market Cap',
  description: 'Daily token supply in USD (market cap) by token within class.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
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
  showTotal: true,

  query: `
    SELECT
      date,
      token,
      token_class,
      value_usd
    FROM dbt.api_execution_tokens_supply_daily
    WHERE token NOT IN ('WxDAI', 'sDAI')
  `,
};

export default metric;
