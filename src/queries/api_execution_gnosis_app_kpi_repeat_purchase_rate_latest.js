const metric = {
  id: 'api_execution_gnosis_app_kpi_repeat_purchase_rate_latest',
  name: 'Repeat Purchase Rate',
  description: 'Last 30 days',
  metricDescription: `Share of \`Gnosis App\` purchasers who bought more than once in the last 30 days (today excluded). A **purchaser** (the denominator) is an address with at least one *filled* CoW swap (\`swap_filled\`) or marketplace buy (\`marketplace_buy\`) in the window; the numerator is those with 2 or more such events combined. Signed-but-unfilled swaps, Gnosis Pay top-ups and token-offer claims do not count as purchases. Reported as a percent.`,
  chartType: 'numberDisplay',
  format: 'formatPercent',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_repeat_purchase_rate_latest`,
};
export default metric;
