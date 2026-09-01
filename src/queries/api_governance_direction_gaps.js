const metric = {
  id: 'api_governance_direction_gaps',
  name: 'Crowd vs Capital',
  description: 'Biggest head-vs-VP gaps',
  metricDescription: 'Per-GIP gap between the against-share by voter headcount and by voting power. Positive = the crowd was more against than the capital. Floors applied for honesty: GIPs only, at least 30 voters (the median GIP has ~68; small-sample divergence is noise), directional ballots only. In 10 of the 12 largest gaps the crowd said yes while capital said no.',
  chartType: 'bar',
  isTimeSeries: false,
  horizontal: true,
  preserveOrder: true,
  format: 'formatPercentage',
  xField: 'label',
  yField: 'value',
  query: `
    SELECT
      substring(title, 1, 60) AS label,
      round(toFloat64(head_minus_weight_against) * 100, 1) AS value
    FROM dbt.api_governance_proposal_direction
    WHERE is_gip = 1 AND voters >= 30 AND directional = 1
      AND head_minus_weight_against IS NOT NULL
    ORDER BY abs(value) DESC
    LIMIT 15
  `,
};
export default metric;
