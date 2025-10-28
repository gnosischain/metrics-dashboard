const metric = {
  id: 'api_consensus_info_apy_latest',
  name: 'Staking APY',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'from 7d ago'
  },
  query: `SELECT * FROM dbt.api_consensus_info_apy_latest`,
};

export default metric;