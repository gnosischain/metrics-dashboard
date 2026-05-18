const metric = {
  id: 'api_consensus_consolidations_daily',
  name: 'Consolidations',
  description: 'Daily EIP-7251 (MaxEB) consolidation events, stacked by role',
  metricDescription: 'Count of consolidation events per day, split into self (credential switch 0x01→0x02), source (validator exiting into another), and target (validator receiving a consolidation). See https://notes.ethereum.org/@fradamt/maxeb-consolidation for the spec.',
  chartType: 'bar',
  isTimeSeries: true,
  format: 'formatNumber',
  stacked: true,

  xField: 'date',
  yField: 'cnt',
  seriesField: 'role',

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT date, role, cnt FROM dbt.api_consensus_consolidations_daily ORDER BY date, role`,
};

export default metric;
