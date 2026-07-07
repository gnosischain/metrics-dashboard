const metric = {
  id: 'api_celo_gpay_balances_usd_daily',
  name: 'Balance by Token',
  description: 'Daily total in USD',
  metricDescription: 'Daily aggregate Safe balances in USD, stacked by token (USDC, USDT). The total line shows the combined USD value across tracked tokens. Balances use the net-flow method over tracked transfers.',
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
    FROM dbt.api_celo_gpay_balances_usd_daily
  `,
};
export default metric;
