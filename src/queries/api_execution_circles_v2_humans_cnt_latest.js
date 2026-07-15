const metric = {
  id: 'api_execution_circles_v2_humans_cnt_latest',
  name: 'Humans',
  description: 'Registered human avatars (cumulative)',
  metricDescription: `**Humans.** Cumulative number of distinct Circles v2 human avatars ever registered via a \`RegisterHuman\` event — individual personal-token accounts, excluding Groups and Organizations. \`total\` is the running total as of the latest complete day (today's partial day is excluded); the delta is the percent change versus that cumulative total 7 days earlier. Registration-based, so it only ever grows — it is not a balance or active-user count.`,
  format: 'formatNumber',
  valueField: 'total',
  chartType: 'numberDisplay',
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_execution_circles_v2_humans_cnt_latest`,
};

export default metric;