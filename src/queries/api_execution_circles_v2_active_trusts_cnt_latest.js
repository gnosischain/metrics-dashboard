const metric = {
  id: 'api_execution_circles_v2_active_trusts_cnt_latest',
  name: 'Active Trusts',
  description: 'Live directed trust edges',
  metricDescription: `**Active Trusts** — the number of directed trust edges currently live in the Circles v2 trust graph, where an edge is a \`truster\` -> \`trustee\` relationship that has been set and not expired or revoked. Computed as the running cumulative of trusts created minus trusts revoked/expired. Reciprocal (mutual) trust counts as **two** edges. Shows the latest complete daily snapshot (current day excluded); the delta is the percent change versus 7 days earlier.`,
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
