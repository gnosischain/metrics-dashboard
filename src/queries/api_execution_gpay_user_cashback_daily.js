const metric = {
  id: 'api_execution_gpay_user_cashback_daily',
  name: 'Cashback History',
  description: 'Daily cashback received (GNO)',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, date, value
    FROM dbt.api_execution_gpay_user_cashback_daily
  `,
};
export default metric;
