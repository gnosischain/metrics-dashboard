const metric = {
  id: 'overview_sector_esg',
  name: 'ESG',
  kpiLabel: 'Network CO2 (kg/day)',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  linkTo: 'esg',
  changePeriod: 'vs 30d ago',
  query: `
    SELECT date, ma7_value AS value
    FROM dbt.api_esg_carbon_emissions_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
