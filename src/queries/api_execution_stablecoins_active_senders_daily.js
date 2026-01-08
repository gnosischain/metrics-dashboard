const metric = {
  id: 'api_execution_stablecoins_active_senders_daily',
  name: 'Active Senders',
  description: 'Daily number of active senders per stablecoin',
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
    FROM dbt.api_execution_stablecoins_active_senders_daily
  `,
};

export default metric;

