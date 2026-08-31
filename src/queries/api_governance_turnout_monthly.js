const metric = {
  id: 'api_governance_turnout_monthly',
  name: 'GIP Turnout',
  description: 'Monthly average',
  metricDescription: 'Unweighted mean of per-GIP turnout ratios: voting power cast divided by strategy-aware eligible supply (ETH + GNO circulating, plus staked GNO only when the proposal\'s strategy counted it). GIPs only. Months with no GIP ballot are absent, not zero.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatPercentage',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, round(toFloat64(avg_turnout) * 100, 2) AS value
    FROM dbt.api_governance_turnout_monthly
    WHERE avg_turnout IS NOT NULL
    ORDER BY date
  `,
};
export default metric;
