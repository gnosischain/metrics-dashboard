const metric = {
  id: 'overview_sector_network',
  name: 'Network',
  kpiLabel: 'DiscV5 Nodes',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  linkTo: 'network',
  changePeriod: 'vs 30d ago',
  query: `
    SELECT date, SUM(value) AS value
    FROM dbt.api_p2p_discv5_clients_daily
    WHERE metric = 'Clients'
      AND date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
