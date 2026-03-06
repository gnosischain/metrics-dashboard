const metric = {
  id: 'api_p2p_visits_latest_discv4',
  name: 'DiscV4 peer visits',
  metricDescription: `
  Total connection attempts (visits) to DiscV4 peers in the last day crawls.

  The percentage shown is the share of visits that completed without dial or crawl errors.`,
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