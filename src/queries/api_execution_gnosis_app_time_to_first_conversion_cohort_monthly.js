const metric = {
  id: 'api_execution_gnosis_app_time_to_first_conversion_cohort_monthly',
  name: 'Time to First Conversion',
  description: 'Median days from onboard to first conversion, by cohort',
  metricDescription: 'For each onboarding-month cohort × conversion kind (topup / swap_filled / marketplace_buy / token_offer_claim), the median (and p25 / p75) days between first-seen-at and first conversion event. Lower = faster onboarding-to-conversion.',
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
