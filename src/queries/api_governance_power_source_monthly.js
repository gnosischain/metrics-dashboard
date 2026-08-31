const metric = {
  id: 'api_governance_power_source_monthly',
  name: 'Voting Power by Source',
  description: 'Monthly, stacked',
  metricDescription: 'Voting power cast per month split by where the power came from: delegated VP, direct GNO holdings, or staked GNO (GBC — counted only by early voting strategies). Stacked composition of capital, not of voters.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  stacked: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT date, label, value
    FROM dbt.api_governance_power_source_monthly
    ORDER BY date, label
  `,
};
export default metric;
