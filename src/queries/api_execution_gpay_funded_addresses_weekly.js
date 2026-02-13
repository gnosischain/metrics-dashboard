const metric = {
  id: 'api_execution_gpay_funded_addresses_weekly',
  name: 'Funded Addresses',
  description: 'Cumulative Gnosis Pay wallets',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, value
    FROM dbt.api_execution_gpay_funded_addresses_weekly
  `,
};
export default metric;
