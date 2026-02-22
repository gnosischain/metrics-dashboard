const metric = {
  id: 'api_execution_gpay_owner_balances_by_token_daily',
  name: 'Owner Balance',
  description: 'Daily owner balance - payment tokens',
  metricDescription: 'Daily owner balances in USD by stablecoin token (EURe, GBPe, USDC.e). Stacked total equals tracked owner balance.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  format: 'formatCurrency',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_owner_balances_by_token_daily
  `,
};
export default metric;
