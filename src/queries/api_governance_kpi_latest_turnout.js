const metric = {
  id: 'api_governance_kpi_latest_turnout',
  name: 'Latest GIP Turnout',
  description: 'Most recent ballot',
  metricDescription: 'Voting power cast on the most recent GIP ballot as a share of eligible supply. The denominator is per-proposal strategy-aware: ETH + GNO circulating supply, plus staked GNO only when that proposal\'s voting strategy counted it.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatPercentage',
  valueField: 'value',
  query: `
    SELECT round(toFloat64(turnout) * 100, 2) AS value
    FROM dbt.api_governance_turnout_latest
    WHERE is_gip = 1 AND turnout IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `,
};
export default metric;
