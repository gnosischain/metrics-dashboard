const metric = {
  id: 'api_governance_activity_monthly',
  name: 'Governance Activity',
  description: 'Monthly',
  metricDescription: 'Proposals created, votes cast, and unique voters per month across the GnosisDAO Snapshot space. Months with zero activity emit no data point.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT
      date,
      multiIf(
        metric = 'proposals_created', 'Proposals created',
        metric = 'votes_cast', 'Votes cast',
        metric = 'unique_voters', 'Unique voters',
        metric
      ) AS series,
      value
    FROM dbt.api_governance_activity_monthly
    ORDER BY date, series
  `,
};
export default metric;
