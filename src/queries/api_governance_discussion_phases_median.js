const metric = {
  id: 'api_governance_discussion_phases_median',
  name: 'Discussion by lifecycle phase',
  description: 'Median posts and likes per GIP in each phase',
  metricDescription: `Median posts and likes-given per GIP, by lifecycle phase
(pre-discussion, pre-vote, voting, post-close).

**Medians, not totals** — and not comparable across phases as rates: pre_discussion and
post_close are unbounded windows while voting is typically ~7 days. An absent phase row
for a proposal means nothing happened there; zeros mean the other activity kind only.

Likes use \`likes_given_in_phase\` (like timestamp), not likes attributed to when the post
was written.

Source: \`dbt.api_governance_discussion_phases\`, GIP-only.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  xField: 'phase_label',
  yField: 'value',
  seriesField: 'label',
  preserveOrder: true,
  format: 'formatNumber',
  query: `
    SELECT
      phase_label,
      label,
      value
    FROM (
      SELECT
        multiIf(
          phase = 'pre_discussion', '1. Pre-discussion',
          phase = 'pre_vote', '2. Pre-vote',
          phase = 'voting', '3. Voting',
          phase = 'post_close', '4. Post-close',
          phase
        ) AS phase_label,
        'Median posts' AS label,
        toFloat64(median(posts)) AS value,
        multiIf(
          phase = 'pre_discussion', 1,
          phase = 'pre_vote', 2,
          phase = 'voting', 3,
          phase = 'post_close', 4,
          9
        ) AS seq
      FROM dbt.api_governance_discussion_phases
      WHERE is_gip = 1
      GROUP BY phase
      UNION ALL
      SELECT
        multiIf(
          phase = 'pre_discussion', '1. Pre-discussion',
          phase = 'pre_vote', '2. Pre-vote',
          phase = 'voting', '3. Voting',
          phase = 'post_close', '4. Post-close',
          phase
        ) AS phase_label,
        'Median likes given' AS label,
        toFloat64(median(likes_given_in_phase)) AS value,
        multiIf(
          phase = 'pre_discussion', 1,
          phase = 'pre_vote', 2,
          phase = 'voting', 3,
          phase = 'post_close', 4,
          9
        ) AS seq
      FROM dbt.api_governance_discussion_phases
      WHERE is_gip = 1
      GROUP BY phase
    )
    ORDER BY seq, label
  `,
};

export default metric;
