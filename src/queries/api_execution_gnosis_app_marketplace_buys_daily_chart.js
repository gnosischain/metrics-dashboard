const metric = {
  id: 'api_execution_gnosis_app_marketplace_buys_daily_chart',
  name: 'Daily Buys by Offer',
  description: 'Daily buys — stacked by offer',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_buys',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  query: `
    SELECT toDate(date) AS date,
           offer_name AS label,
           n_buys
    FROM dbt.api_execution_gnosis_app_marketplace_buys_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
