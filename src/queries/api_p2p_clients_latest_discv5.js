const metric = {
  id: 'api_p2p_clients_latest_discv5',
  name: 'DiscV5 peers',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'discv5_count',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_discv5_pct',
    period: 'from 7d ago'
  },
  query: `SELECT * FROM dbt.api_p2p_clients_latest`,
};

export default metric;