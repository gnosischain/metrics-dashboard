const metric = {
  id: 'api_governance_turnout_monthly',
  name: 'GIP turnout',
  description: 'Average turnout ratio across GIPs closed that month',
  metricDescription: `Monthly average of per-GIP turnout (total voting power cast / eligible GNO supply).
GIP-only. This is a **simple average of ratios**, not population-weighted by supply — use it
for direction, not as an exact participation rate. Months with no GIP have no row.

Eligible supply methodology (circulating on both chains + staked when the proposal's own
strategies include it) lives in \`int_governance_turnout\`.

Source: \`dbt.api_governance_turnout_monthly\`. Values shown as percent.`,
  chartType: 'area',
  format: 'formatPercentage',
  yField: 'value',
  seriesName: 'Turnout',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    SELECT
      date,
      round(avg_turnout * 100, 2) AS value
    FROM dbt.api_governance_turnout_monthly
    WHERE date BETWEEN '{from}' AND '{to}'
      AND avg_turnout IS NOT NULL
    ORDER BY date
  `,
};

export default metric;
