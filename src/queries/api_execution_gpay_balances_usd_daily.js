const metric = {
  id: 'api_execution_gpay_balances_usd_daily',
  name: 'Balance by Token (USD)',
  description: 'Daily wallet balance in USD',
  metricDescription: 'Daily wallet balances in USD split by token (EURe, GBPe, USDC.e, GNO). Stacked total shows full wallet balance.',
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
    FROM dbt.api_execution_gpay_balances_usd_daily
  `,
};
export default metric;
