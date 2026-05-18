const metric = {
  id: 'api_consensus_validators_explorer_balance_daily',
  globalFilterField: 'withdrawal_credentials',
  name: 'Balance (GNO)',
  description: 'Daily end-of-day balance summed across the selected validator(s)',
  metricDescription: 'Sum of balance_gno across every validator sharing the selected withdrawal_credentials, day by day. For a solo credential this is that validator\'s own balance trend; for an operator credential it is the pooled balance across all its validators.',
  chartType: 'area',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',

  xField: 'date',
  yField: 'balance_gno',

  smooth: true,
  lineWidth: 2,
  areaOpacity: 0.3,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `
    SELECT withdrawal_credentials, date, balance_gno
    FROM dbt.api_consensus_validators_explorer_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};

export default metric;
