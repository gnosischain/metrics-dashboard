const metric = {
  id: 'overview_stake_gno',
  name: 'Staked GNO',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.5rem', 
  fontSize: '3rem',    
  query: `SELECT CONCAT('+',toString(floor(value/1000)), 'K') AS value FROM dbt.api_consensus_info_staked_latest`
};

export default metric;
