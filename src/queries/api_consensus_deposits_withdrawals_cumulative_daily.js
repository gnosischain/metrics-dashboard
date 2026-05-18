const metric = {
  id: 'api_consensus_deposits_withdrawals_cumulative_daily',
  name: 'Cumulative Deposits vs Withdrawals',
  description: 'Running total of consensus deposits and withdrawals over time (GNO)',
  metricDescription: 'Cumulative sum (from genesis) of daily deposit and withdrawal volumes. Deposits include both the beacon-chain deposit queue and EIP-7002/7251 execution-request deposits.',
  chartType: 'line',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',

  xField: 'date',
  yField: 'cumulative_amount_gno',
  seriesField: 'label',

  smooth: true,
  lineWidth: 2,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `
    SELECT
      date,
      label,
      SUM(total_amount) OVER (PARTITION BY label ORDER BY date) AS cumulative_amount_gno
    FROM dbt.int_consensus_deposits_withdrawals_daily
    ORDER BY date, label
  `,
};

export default metric;
