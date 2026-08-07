const metric = {
  id: 'api_governance_electorate_vp_monthly',
  name: 'Median voting power per GIP',
  description: 'How much capital a typical GIP attracted that month',
  metricDescription: `Monthly median of total voting power cast per GIP Snapshot ballot.
GIP-only; months with no GIP are absent. Drawn beside **Median voters per GIP** on purpose:
headcount can stay modest while capital stays large (or the reverse). Medians, not means —
participation is heavily skewed.

Source: \`dbt.api_governance_electorate_monthly\`.`,
  chartType: 'area',
  format: 'formatNumberCompact',
  yField: 'value',
  seriesName: 'Median VP',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    SELECT
      date,
      toFloat64(median_vp_per_proposal) AS value
    FROM dbt.api_governance_electorate_monthly
    WHERE date BETWEEN '{from}' AND '{to}'
    ORDER BY date
  `,
};

export default metric;
