const metric = {
  id: 'api_execution_circles_v2_group_explorer_avg_score_latest',
  name: 'Avg Member Score',
  description: 'Mean member mint score (score-based groups)',
  metricDescription: `Average of members' latest on-chain **mint scores**, for **score-based groups** — those minting through the \`OffchainScoreBasedMintPolicy\` (\`0x450d…\`). Each member's score is their off-chain trust score recorded at their most recent \`PersonalMinted\` event (raw integer; the policy's \`MAX_SCORE()\` is the ceiling). Shows "—" for groups that do not use score-based minting.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT round(avg(score), 1) AS value
    FROM dbt.api_execution_circles_v2_group_member_scores
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
