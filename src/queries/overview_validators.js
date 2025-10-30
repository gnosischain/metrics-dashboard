const metric = {
  id: 'overview_validators',
  name: 'Validators',
  valueField: 'value',
  chartType: 'number',
  titleFontSize: '1.8rem', 
  fontSize: '3rem',      
  query: `SELECT CONCAT('+',toString(floor(value/1000)), 'K') AS value  FROM dbt.api_consensus_info_active_ongoing_latest`
};

export default metric;