const metric = {
  id: 'api_execution_circles_groups_cnt_latest',
  name: 'Groups',
  format: 'formatNumber',
  valueField: 'total',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_execution_circles_groups_cnt_latest`,
};

export default metric;