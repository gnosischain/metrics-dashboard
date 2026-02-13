const metric = {
  id: 'api_execution_gpay_gno_balance_daily',
  name: 'GNO Wallet Balance',
  description: 'Total GNO held in GPay wallets',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, value
    FROM dbt.api_execution_gpay_gno_balance_daily
  `,
};
export default metric;
