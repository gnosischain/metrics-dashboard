const metric = {
  id: 'overview_kpi_validators',
  name: 'Active Validators',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Number of validators in active_ongoing status on Gnosis Chain. Post-Pectra, validator count has declined due to consolidation. For network security, check Staked GNO.',
  query: `
    SELECT date, cnt AS value
    FROM dbt.api_consensus_validators_active_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
