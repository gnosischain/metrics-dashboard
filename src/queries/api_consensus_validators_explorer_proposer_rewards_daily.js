const metric = {
  id: 'api_consensus_validators_explorer_proposer_rewards_daily',
  name: 'Proposer Rewards',
  description: 'Daily proposer rewards (GNO) earned by the selected validator(s)',
  metricDescription: 'Sum of proposer_reward_total_gno for the selected withdrawal_credentials, by day. Bars only appear on days when a validator in the group was selected to propose a block.',
  chartType: 'bar',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',

  xField: 'date',
  yField: 'proposer_reward_total_gno',

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT date, proposer_reward_total_gno FROM dbt.api_consensus_validators_explorer_daily ORDER BY date`,
};

export default metric;
