const metric = {
  id: 'api_governance_electorate_voters_monthly',
  name: 'Median voters per GIP',
  description: 'How many people showed up on a typical GIP that month',
  metricDescription: `Monthly median of distinct voters per GIP Snapshot ballot. GIP-only; months
with no GIP are absent. Pair with **Median VP per GIP** next to it — people and capital
move differently, and raw vote-count charts after 2022 are dominated by the end of an
airdrop-farming bubble rather than a collapse of engagement.

Source: \`dbt.api_governance_electorate_monthly\`.`,
  chartType: 'area',
  format: 'formatNumber',
  yField: 'value',
  seriesName: 'Median voters',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    SELECT
      date,
      toFloat64(median_voters_per_proposal) AS value
    FROM dbt.api_governance_electorate_monthly
    WHERE date BETWEEN '{from}' AND '{to}'
    ORDER BY date
  `,
};

export default metric;
