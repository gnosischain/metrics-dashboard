const metric = {
  id: 'api_governance_power_source_monthly',
  name: 'Voting power by source',
  description: 'GNO holdings, delegated, and staked GNO (when present)',
  metricDescription: `Monthly sum of voting power attributed to Snapshot strategy families:
GNO holdings, Delegated, and Staked GNO (GBC). Long-format stacked series.

**Staked GNO is sparse** — it only appears in months where proposals carried that strategy.
An empty stretch is missing strategy coverage, not zero stake. Delegation here is the
per-vote power split from Snapshot strategies, not the on-chain DelegateRegistry graph
(see Delegates table).

Source: \`dbt.api_governance_power_source_monthly\`.`,
  chartType: 'area',
  stacked: true,
  format: 'formatNumberCompact',
  yField: 'value',
  seriesField: 'label',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    SELECT
      date,
      label,
      toFloat64(value) AS value
    FROM dbt.api_governance_power_source_monthly
    WHERE date BETWEEN '{from}' AND '{to}'
    ORDER BY date, label
  `,
};

export default metric;
