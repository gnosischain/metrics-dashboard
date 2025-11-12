const metric = {
  id: 'api_p2p_visits_latest_discv4',
  name: 'DiscV4 peer visits',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'discv4_total_visits',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'discv4_pct_successful', // Field containing change data
    period: 'successful' // Display text for the change period
  },
  query: `SELECT * FROM dbt.api_p2p_visits_latest`,
};

export default metric;