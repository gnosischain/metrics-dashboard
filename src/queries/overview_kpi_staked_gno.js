const metric = {
  id: 'overview_kpi_staked_gno',
  name: 'Staked GNO',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Total GNO staked in the Gnosis Chain consensus layer.',
  query: `
    SELECT date, value
    FROM dbt.api_consensus_staked_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
