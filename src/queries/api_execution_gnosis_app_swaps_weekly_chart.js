const metric = {
  id: 'api_execution_gnosis_app_swaps_weekly_chart',
  name: 'Swaps (weekly)',
  description: 'Weekly count and filled USD volume',
  metricDescription: `Weekly Gnosis App swap activity on CoW Protocol. **Signed Orders** (\`n_swaps\`) counts \`PreSignature\` signings on \`GPv2Settlement\` (\`signed='1'\`, so revocations are excluded) that were routed through the Cometh ERC-4337 bundler and whose order owner is a known Gnosis App user; **Volume (USD)** sums \`amount_usd\` over the orders that actually filled (\`was_filled\`), so unfilled signed orders still count toward the order tally but contribute $0 volume. Weeks start Monday; the current incomplete week is excluded and coverage begins 2025-11-12.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_swaps',
  format: 'formatNumber',
  valueModeOptions: [
    { key: 'n_swaps',           label: 'Signed Orders', valueField: 'n_swaps',           format: 'formatNumber' },
    { key: 'volume_usd_filled', label: 'Volume (USD)',  valueField: 'volume_usd_filled', format: 'formatCurrency' },
  ],
  defaultValueMode: 'n_swaps',
  query: `
    SELECT toDate(week) AS date, n_swaps, volume_usd_filled
    FROM dbt.api_execution_gnosis_app_swaps_weekly
    ORDER BY date ASC
  `,
};
export default metric;
