const metric = {
  id: 'api_execution_stablecoins_holders_daily',
  name: 'Stablecoin Holders',
  description: 'Daily number of holders per stablecoin',
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
    FROM dbt.api_execution_stablecoins_holders_daily
  `,
};

export default metric;

