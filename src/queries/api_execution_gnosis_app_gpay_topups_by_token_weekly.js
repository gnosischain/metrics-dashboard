const metric = {
  id: 'api_execution_gnosis_app_gpay_topups_by_token_weekly',
  name: 'TopUps by Token',
  description: 'Weekly — deposited token breakdown',
  metricDescription: `**Gnosis Pay top-ups, split by deposited token.** Weekly (Monday-aligned) count of top-up events (\`n_topups\`), stacked by the token that was deposited (\`token_bought_symbol\`, shown as \`unknown\` when the symbol is missing). A **top-up** is a Gnosis Pay "Crypto Deposit" into a wallet currently owned by a Gnosis App user, counted from the GA launch (2025-11-12) onward; it counts every such deposit, not only in-app swaps. The current, still-incomplete week is excluded.`,
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
    WHERE date < toStartOfWeek(today(), 1)
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
