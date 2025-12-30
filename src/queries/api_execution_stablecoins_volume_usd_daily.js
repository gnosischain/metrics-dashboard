const metric = {
  id: 'api_execution_stablecoins_volume_usd_daily',
  name: 'Stablecoin Transfer Volume (USD)',
  description: 'Daily transfer volume in USD per stablecoin',
  chartType: 'area',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100,
  },
  xField: 'date',
  yField: 'value',
  enableFiltering: true,
  labelField: 'token',
  format: 'formatCurrency',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT
      date,
      token,
      value
    FROM dbt.api_execution_stablecoins_volume_usd_daily
  `,
};

export default metric;

