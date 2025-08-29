const metric = {
  id: 'api_execution_circles_orgs_cnt_latest',
  name: 'Organizations',
  format: 'formatNumber',
  valueField: 'total',
  chartType: 'numberDisplay',
  variant: 'compact', 
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_execution_circles_orgs_cnt_latest`,
};

export default metric;