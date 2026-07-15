const metric = {
  id: 'api_execution_circles_v2_orgs_cnt_latest',
  name: 'Organizations',
  description: 'Registered organization avatars (cumulative)',
  metricDescription: `**Organizations** = the cumulative count of distinct Circles v2 organization avatars ever registered (\`RegisterOrganization\` on the Hub) — accounts that hold, trust and route Circles but never mint a personal token. Shown as of the latest complete day (today excluded); the delta compares this running total against its value 7 days ago.`,
  format: 'formatNumber',
  valueField: 'total',
  chartType: 'numberDisplay',
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_execution_circles_v2_orgs_cnt_latest`,
};

export default metric;