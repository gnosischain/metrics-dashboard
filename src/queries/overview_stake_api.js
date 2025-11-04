const metric = {
  id: 'overview_stake_api',
  name: 'Staking APY',
  valueField: 'value',
  chartType: 'number',
  format: 'formatPercentage',
  titleFontSize: '1.3rem', 
  fontSize: '2.6rem',    
  color: '#4caf50',
  query: `SELECT round(value,2) AS value FROM dbt.api_consensus_info_apy_latest`
};

export default metric;
