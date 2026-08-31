const metric = {
  id: 'api_governance_gip_funnel',
  name: 'GIP Funnel',
  description: 'Forum → ballot → passed',
  metricDescription: 'How far GIPs travel: raised on the forum only, balloted on Snapshot, and passed. Stage order is preserved by the numeric prefix.',
  chartType: 'bar',
  isTimeSeries: false,
  preserveOrder: true,
  format: 'formatNumber',
  xField: 'stage',
  yField: 'value',
  query: `
    SELECT
      concat(toString(stage_order), '. ', stage) AS stage,
      toFloat64(gip_count) AS value
    FROM dbt.api_governance_gip_funnel
    ORDER BY stage
  `,
};
export default metric;
