const metric = {
  id: 'api_execution_gnosis_app_gpay_topups_by_token_weekly',
  name: 'TopUps by Token',
  description: 'Weekly — bought token breakdown',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_topups',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  query: `
    SELECT toStartOfWeek(date, 1) AS date,
           coalesce(token_bought_symbol, 'unknown') AS label,
           sum(n_topups) AS n_topups
    FROM dbt.api_execution_gnosis_app_gpay_topups_by_token_daily
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
