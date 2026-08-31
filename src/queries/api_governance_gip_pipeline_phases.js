const metric = {
  id: 'api_governance_gip_pipeline_phases',
  name: 'GIP Pipeline',
  description: 'By phase and dormancy',
  metricDescription: 'Current forum GIP topics by phase tag, split by dormancy (idle for more than 45 days). Active and dormant partition the topics, so the stacked total is all topics in the phase.',
  chartType: 'bar',
  isTimeSeries: false,
  stacked: true,
  format: 'formatNumber',
  xField: 'phase',
  yField: 'value',
  seriesField: 'status',
  query: `
    SELECT
      phase,
      if(is_dormant = 1, 'Dormant >45d', 'Active') AS status,
      toFloat64(count()) AS value
    FROM dbt.api_governance_gip_pipeline_latest
    GROUP BY phase, is_dormant
    ORDER BY phase, status
  `,
};
export default metric;
