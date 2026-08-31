const metric = {
  id: 'api_governance_electorate_vp_monthly',
  name: 'Median VP per GIP Proposal',
  description: 'Monthly',
  metricDescription: 'Monthly median voting power cast per GIP proposal. Companion to "Voters per GIP Proposal": capital participation held up far better than voter headcount after the 2022 airdrop bubble.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, median_vp_per_proposal AS value
    FROM dbt.api_governance_electorate_monthly
    ORDER BY date
  `,
};
export default metric;
