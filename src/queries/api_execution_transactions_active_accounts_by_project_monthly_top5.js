const metric = {
  id: 'api_execution_transactions_active_accounts_by_project_monthly_top5',
  name: 'Top-5 Projects by Transactions',
  description: 'Monthly number transactions per project',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  showTotal: true, 
  
  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],

  symbolSize: 2,
  lineWidth: 2,
  barOpacity: 0.8,  
  
  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT * FROM dbt.api_execution_transactions_active_accounts_by_project_monthly_top5
`,
};

export default metric;