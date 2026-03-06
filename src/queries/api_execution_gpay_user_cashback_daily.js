
const metric = {
  id: 'api_execution_gpay_user_cashback_daily',
  name: 'Cashback History',
  description: 'Daily cashback received (GNO)',
  metricDescription: `
  Daily GNO cashback received by the selected wallet. 
  Each bar represents the total GNO earned from the cashback program on that day.
  `,
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
