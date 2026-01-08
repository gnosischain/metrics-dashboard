const metric = {
  id: 'api_execution_stablecoins_supply_by_token_daily',
  name: 'Stablecoin Supply by Token',
  description: 'Daily supply breakdown by stablecoin',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100,
  },
  xField: 'date',
  yField: 'value',
  seriesField: 'token',
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

