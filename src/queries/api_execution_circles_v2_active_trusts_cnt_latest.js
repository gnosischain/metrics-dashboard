const metric = {
  id: 'api_execution_circles_v2_active_trusts_cnt_latest',
  name: 'Active Trusts',
  format: 'formatNumber',
  valueField: 'total',
  chartType: 'numberDisplay',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'from 7d ago'
  },
  query: `SELECT * FROM dbt.api_execution_circles_v2_active_trusts_cnt_latest`,
};

export default metric;
