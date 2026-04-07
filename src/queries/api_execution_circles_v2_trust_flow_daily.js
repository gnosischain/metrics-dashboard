const metric = {
  id: 'api_execution_circles_v2_trust_flow_daily',
  name: 'Trust Creations vs Revocations',
  description: 'Daily new vs revoked trust relationships',
  metricDescription: 'Daily count of newly created versus revoked Circles v2 trust relationships.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT date, 'New' AS label, new_trusts AS value
    FROM dbt.api_execution_circles_v2_active_trusts_daily
    UNION ALL
    SELECT date, 'Revoked' AS label, revoked_trusts AS value
    FROM dbt.api_execution_circles_v2_active_trusts_daily
  `,
};

export default metric;
