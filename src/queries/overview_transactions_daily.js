const metric = {
  id: 'overview_transactions_daily',
  name: 'Daily Transactions',
  description: 'Transactions per day on Gnosis Chain',
  metricDescription: 'All successful transactions on Gnosis Chain per day.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  defaultTimeRange: '1Y',
  format: 'formatNumberCompact',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, SUM(value) AS value
    FROM dbt.api_execution_transactions_cnt_daily
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
