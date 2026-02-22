const metric = {
  id: 'api_consensus_credentials_latest',
  name: 'Withdrawal Credentials Type',
  description: 'Current Distribution: 0x00 (BLS), 0x01 (ETH1) and 0x02 (Compound)',
  metricDescription: 'Current validator withdrawal credential split (0x00, 0x01, 0x02). Shares reflect migration from legacy to ETH1 and compounding credential formats.',
  chartType: 'pie', 
  format: 'formatNumber',
  
  nameField: 'credentials_type',
  valueField: 'cnt',

  query: `SELECT * FROM dbt.api_consensus_credentials_latest`,
};

export default metric;