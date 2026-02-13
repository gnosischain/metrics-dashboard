const metric = {
  id: 'api_execution_gpay_balances_by_token_daily',
  name: 'Wallet Balance',
  description: 'Daily wallet balance',
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
    FROM dbt.api_execution_gpay_balances_by_token_daily
  `,
};
export default metric;
