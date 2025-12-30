const metric = {
  id: 'api_execution_stablecoins_supply_daily',
  name: 'Stablecoin Supply',
  description: 'Daily circulating supply per stablecoin',
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
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT
      date,
      token,
      value
    FROM dbt.api_execution_stablecoins_supply_daily
  `,
};

export default metric;

