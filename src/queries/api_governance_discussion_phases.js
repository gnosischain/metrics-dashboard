const metric = {
  id: 'api_governance_discussion_phases',
  name: 'Discussion by Phase',
  description: 'Forum posts per lifecycle phase',
  metricDescription: 'Forum posts per proposal lifecycle phase, GIPs only. The pre-vote phase is structurally near-empty because GnosisDAO opens voting at proposal creation — that is a fact of the process, not missing data. Phases have unequal window lengths, so raw cross-phase counts are not like-for-like.',
  chartType: 'bar',
  isTimeSeries: false,
  preserveOrder: true,
  format: 'formatNumber',
  xField: 'phase',
  yField: 'value',
  query: `
    SELECT
      multiIf(
        phase = 'pre_discussion', '1. Pre-discussion',
        phase = 'pre_vote', '2. Pre-vote',
        phase = 'voting', '3. Voting',
        phase = 'post_close', '4. Post-close',
        phase
      ) AS phase,
      toFloat64(sum(posts)) AS value
    FROM dbt.api_governance_discussion_phases
    WHERE is_gip = 1
    GROUP BY phase
    ORDER BY phase
  `,
};
export default metric;
