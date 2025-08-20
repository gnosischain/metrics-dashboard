const metric = {
  id: 'api_consensus_info_active_ongoing_latest',
  name: 'Active Validators',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_pct', // Field containing change data
    period: 'from 7d ago' // Display text for the change period
  },
  query: `SELECT * FROM dbt.api_consensus_info_active_ongoing_latest`,
};

export default metric;