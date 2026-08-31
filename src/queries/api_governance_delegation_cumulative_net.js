const metric = {
  id: 'api_governance_delegation_cumulative_net',
  name: 'Cumulative Net Delegations',
  description: 'Running total',
  metricDescription: 'Running sum of monthly net delegation changes (delegations set minus cleared). Cross-checked exactly against the current-delegations snapshot.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, sum(v) OVER (ORDER BY date) AS value
    FROM (
      SELECT date, toFloat64(value) AS v
      FROM dbt.api_governance_delegation_activity_monthly
      WHERE metric = 'net_change' AND date IS NOT NULL
      ORDER BY date
    )
    ORDER BY date
  `,
};
export default metric;
