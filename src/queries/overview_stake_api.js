const metric = {
  id: 'overview_stake_api',
  name: 'Staking APY',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.5rem', 
  fontSize: '3rem',    
  color: '#4caf50',
  query: `SELECT CONCAT(toString(round(value,2)), '%') AS value FROM dbt.api_consensus_info_apy_latest`
};

export default metric;
