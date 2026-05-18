const metric = {
  id: 'overview_sector_yields',
  name: 'Yields',
  kpiLabel: 'LP TVL',
  chartType: 'kpi',
  valueField: 'value',
  format: 'formatCurrencyCompact',
  linkTo: 'yields',
  // Use canonical snapshot so the value matches the Yields sector page exactly.
  query: `
    SELECT today() AS date, value
    FROM dbt.api_execution_yields_overview_lp_tvl
  `
};

export default metric;
