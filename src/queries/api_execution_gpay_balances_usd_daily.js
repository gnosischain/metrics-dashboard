const metric = {
  id: 'api_execution_gpay_balances_usd_daily',
  name: 'Balance by Token',
  description: 'Daily total in USD',
  metricDescription: 'Daily aggregate wallet balances in USD, stacked by token (EURe, GBPe, USDC.e, GNO). The total line shows the combined USD value across all tokens.',
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
