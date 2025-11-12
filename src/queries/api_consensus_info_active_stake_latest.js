const metric = {
  id: 'api_consensus_info_active_stake_latest',
  name: 'Active Stake',
  format: 'formatNumberWithGNO',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_consensus_info_staked_latest`,
};

export default metric;