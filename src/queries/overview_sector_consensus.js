const metric = {
  id: 'overview_sector_consensus',
  name: 'Consensus',
  kpiLabel: 'Median Validator APY',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatPercentage',
  linkTo: 'consensus',
  changePeriod: 'vs 30d ago',
  query: `
    SELECT date, q50 AS value
    FROM dbt.api_consensus_validators_apy_dist_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
