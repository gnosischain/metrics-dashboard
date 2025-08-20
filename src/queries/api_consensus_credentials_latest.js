const metric = {
  id: 'api_consensus_credentials_latest',
  name: 'Withdrawl Credentials Type',
  description: 'Current Distribution: 0x00 (BLS), 0x01 (ETH1) and 0x02 (Compound)',
  chartType: 'pie', 
  format: 'formatNumber',
  
  nameField: 'credentials_type',
  valueField: 'cnt',

  query: `SELECT * FROM dbt.api_consensus_credentials_latest`,
};

export default metric;