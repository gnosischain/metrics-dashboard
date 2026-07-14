const metric = {
  id: 'api_execution_gnosis_app_time_to_first_conversion_cohort_monthly',
  name: 'Time to First Conversion',
  description: 'Median days from onboard to first conversion, by cohort',
  metricDescription: `Median days from a user's onboarding to their first conversion of each kind, split by onboard-month cohort and \`conversion_kind\` (\`topup\` / \`swap_filled\` / \`marketplace_buy\` / \`token_offer_claim\`). The cohort anchor \`first_seen_at\` is a heuristic-derived onboard date (first day the address shows an \`onboard\` activity); \`median_days\`, \`p25_days\`, and \`p75_days\` are \`dateDiff('day', first_seen_at, first_conversion_at)\` over converters only, floored at 0 because the heuristic onboard date can land after a user's real first action. Also carries \`n_in_cohort\`, \`n_converted\`, and \`pct_converted\`; the current partial month is excluded. Lower = faster onboarding-to-conversion.`,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'cohort_month',
  yField: 'median_days',
  seriesField: 'conversion_kind',
  query: `
    SELECT cohort_month, conversion_kind, median_days, n_in_cohort, n_converted, pct_converted, p25_days, p75_days
    FROM dbt.api_execution_gnosis_app_time_to_first_conversion_cohort_monthly
    ORDER BY cohort_month, conversion_kind
  `,
};
export default metric;
