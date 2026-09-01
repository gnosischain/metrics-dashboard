const metric = {
  id: 'api_governance_delegation_events_monthly',
  name: 'Delegation Events',
  description: 'Monthly',
  metricDescription: 'Snapshot delegation churn per month: first-time delegators, repointed delegations, and cleared delegations. The three event classes are disjoint, so the stacked total is all delegation events that month.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  stacked: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT
      date,
      multiIf(
        metric = 'new_delegators', 'New delegators',
        metric = 'repointed', 'Repointed',
        metric = 'clear_events', 'Cleared',
        metric
      ) AS series,
      value
    FROM dbt.api_governance_delegation_activity_monthly
    WHERE date IS NOT NULL
      AND metric IN ('new_delegators', 'repointed', 'clear_events')
    ORDER BY date, series
  `,
};
export default metric;
