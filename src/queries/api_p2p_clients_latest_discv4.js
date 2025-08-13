const metric = {
  id: 'api_p2p_clients_latest_discv4',
  name: 'DiscV4 peers',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'discv4_count',
  chartType: 'numberDisplay',
  variant: 'compact', // New: Use compact layout
  changeData: {
    enabled: true,
    field: 'change_discv4_pct', // Field containing change data
    period: 'from 7d ago' // Display text for the change period
  },
  query: `SELECT * FROM dbt.api_p2p_clients_latest`,
};

export default metric;