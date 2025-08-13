const metric = {
  id: 'api_p2p_visits_latest_discv5',
  name: 'DiscV5 peer visits',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'discv5_total_visits',
  chartType: 'numberDisplay',
  variant: 'compact', // New: Use compact layout
  changeData: {
    enabled: true,
    field: 'discv5_pct_successful', // Field containing change data
    period: 'successful' // Display text for the change period
  },
  query: `SELECT * FROM dbt.api_p2p_visits_latest`,
};

export default metric;