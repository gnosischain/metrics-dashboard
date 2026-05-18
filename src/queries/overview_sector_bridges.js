const metric = {
  id: 'overview_sector_bridges',
  name: 'Bridges',
  kpiLabel: '7D Bridge Volume',
  chartType: 'kpi',
  valueField: 'value',
  format: 'formatCurrencyCompact',
  linkTo: 'bridges',
  // Canonical 7D volume from the Bridges KPI view, matches the Bridges page.
  query: `
    SELECT today() AS date, value
    FROM dbt.api_bridges_kpi_volume_7d
  `
};

export default metric;
