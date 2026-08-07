const metric = {
  id: 'api_governance_poll_gap_bar',
  name: 'Largest forum–token gaps',
  description: 'Pre-vote checks ranked by |forum against − Snapshot against|',
  metricDescription: `Top pre-vote temperature checks by absolute gap between forum against-share
and Snapshot against-share (by VP). Positive = community more opposed than capital;
negative = capital more opposed than the forum.

Filter: \`is_pre_vote_check = 1\` only. Poll n is small — treat as directional.

Source: \`dbt.api_governance_poll_vs_vote\`.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  xField: 'label',
  yField: 'value',
  seriesName: 'Gap',
  preserveOrder: true,
  format: 'formatPercentage',
  query: `
    SELECT
      concat('GIP-', toString(gip_number)) AS label,
      round(poll_minus_vote_vp * 100, 1) AS value
    FROM dbt.api_governance_poll_vs_vote
    WHERE is_pre_vote_check = 1
      AND poll_minus_vote_vp IS NOT NULL
      AND gip_number IS NOT NULL
    ORDER BY abs(poll_minus_vote_vp) DESC
    LIMIT 12
  `,
};

export default metric;
