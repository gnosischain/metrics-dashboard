const metric = {
  id: 'api_execution_tokens_supply_daily',
  name: 'Token Supply',
  description: 'Daily circulating supply per token (excluding burn address).',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100,
  },
  xField: 'date',
  yField: 'value',
  // We use labelField so the generic dropdown component
  // lets you pick the token
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',

  query: `
    SELECT
      date,
      token,
      value
    FROM dbt.api_execution_tokens_supply_daily
  `,
};

export default metric;