const metric = {
  id: 'api_celo_gpay_funnel_cohorts_monthly',
  name: 'Funnel by Issuance Cohort',
  description: '30-day funded and activated rates',
  metricDescription: `
  Age-normalised funnel for MiniPay cards on Celo, by the month the card was
  __issued__. Each point is a cohort, not a calendar month of activity.

  - __Funded in 30d:__ share of that cohort that received money within 30 days of issuance
  - __Activated in 30d:__ share that spent within 30 days of issuance
  - __Spend given funded (30d):__ second-leg conversion among cards that funded in 30d

  Rates are NULL while the cohort is still too young (not zero) — gaps, not cliffs.
  All-time "ever" rates are deliberately not charted here: they slope down for recent
  cohorts because of less observation time, not worse conversion. Celo-only.
  `,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatPercentageInt',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    -- Rates are 0-1 in dbt; multiply to percent to match formatPercentageInt
    -- (same scale as api_celo_gpay_churn_rates_monthly).
    SELECT toDate(month) AS date, 'Funded in 30d' AS label, funded_rate_30d * 100 AS value
    FROM dbt.api_celo_gpay_funnel_cohorts_monthly
    WHERE funded_rate_30d IS NOT NULL

    UNION ALL

    SELECT toDate(month) AS date, 'Activated in 30d' AS label, activated_rate_30d * 100 AS value
    FROM dbt.api_celo_gpay_funnel_cohorts_monthly
    WHERE activated_rate_30d IS NOT NULL

    UNION ALL

    SELECT toDate(month) AS date, 'Spend given funded (30d)' AS label, spend_rate_of_funded_30d * 100 AS value
    FROM dbt.api_celo_gpay_funnel_cohorts_monthly
    WHERE spend_rate_of_funded_30d IS NOT NULL

    ORDER BY date, label
  `,
};
export default metric;
