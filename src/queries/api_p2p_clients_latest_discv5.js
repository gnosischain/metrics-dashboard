const metric = {
  id: 'api_p2p_clients_latest_discv5',
  name: 'DiscV5 peers',
  metricDescription: `
  Total unique DiscV5 peers discovered in the last day crawls. Only peers advertising a known consensus fork are counted.

  The change percentage compares to the count from 7 days ago.`,
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