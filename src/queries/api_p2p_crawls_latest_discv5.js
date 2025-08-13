const metric = {
  id: 'api_p2p_crawls_latest_discv5',
  name: 'DiscV5 crawls',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'discv5_crawls',
  chartType: 'numberDisplay',
  variant: 'compact', // New: Use compact layout
  changeData: {
    enabled: true,
    field: 'change_discv5_crawls_pct', // Field containing change data
    period: 'from 7d ago' // Display text for the change period
  },
  query: `SELECT * FROM dbt.api_p2p_visits_latest`,
};

export default metric;