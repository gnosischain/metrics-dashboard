const metric = {
  id: 'api_consensus_info_deposits_cnt_latest',
  name: 'Deposists',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_pct', // Field containing change data
    period: 'from 7d ago' // Display text for the change period
  },
  query: `SELECT * FROM dbt.api_consensus_info_deposits_cnt_latest`,
};

export default metric;