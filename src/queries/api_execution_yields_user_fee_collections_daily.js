const metric = {
  id: 'api_execution_yields_user_fee_collections_daily',
  name: 'LP Fee Income',
  description: 'Daily fees collected by pool',
  metricDescription: 'Daily LP fee income from Collect events across all V3 pools for the selected wallet. Each bar segment represents a different pool.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'fees_usd',
  seriesField: 'pool_address',
  format: 'formatCurrency',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  enableZoom: false,
  globalFilterField: 'provider',
  query: `
    SELECT provider AS wallet_address, date, pool_address, protocol, fees_usd
    FROM dbt.api_execution_yields_user_fee_collections_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
