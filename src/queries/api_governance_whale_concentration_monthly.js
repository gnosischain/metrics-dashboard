const metric = {
  id: 'api_governance_whale_concentration_monthly',
  name: 'Voting power concentration',
  description: 'Median top-1 / top-5 / top-10 share of VP on GIPs each month',
  metricDescription: `For each month, the median share of voting power cast by the largest voter, the
top 5, and the top 10 on GIP ballots that month. A raw voter count can look healthy while
one or two wallets decide the outcome — this chart is the check.

GIP-only (\`is_gip = 1\`). Shares are percent of total VP cast on that proposal.

Source: aggregated from \`dbt.api_governance_whale_concentration\`.`,
  chartType: 'line',
  format: 'formatPercentage',
  yField: 'value',
  seriesField: 'label',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    WITH monthly AS (
      SELECT
        toStartOfMonth(created_at) AS date,
        median(top1_share) AS med_top1,
        median(top5_share) AS med_top5,
        median(top10_share) AS med_top10
      FROM dbt.api_governance_whale_concentration
      WHERE is_gip = 1
        AND top10_share IS NOT NULL
        AND toDate(created_at) BETWEEN '{from}' AND '{to}'
      GROUP BY date
    )
    SELECT date, label, value
    FROM (
      SELECT date, 'Top 1 share' AS label, round(med_top1 * 100, 1) AS value, 1 AS seq FROM monthly
      UNION ALL
      SELECT date, 'Top 5 share' AS label, round(med_top5 * 100, 1) AS value, 2 AS seq FROM monthly
      UNION ALL
      SELECT date, 'Top 10 share' AS label, round(med_top10 * 100, 1) AS value, 3 AS seq FROM monthly
    )
    ORDER BY date, seq
  `,
};

export default metric;
