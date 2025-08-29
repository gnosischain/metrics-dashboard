const metric = {
  id: 'api_consensus_info_staked_latest',
  name: 'Staked GNO',
  format: 'formatNumber',
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