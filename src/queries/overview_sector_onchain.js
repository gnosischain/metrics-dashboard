const metric = {
  id: 'overview_sector_onchain',
  name: 'OnChain Activity',
  kpiLabel: 'Indexed Projects',
  chartType: 'kpi',
  valueField: 'value',
  format: 'formatNumberCompact',
  linkTo: 'onchainactivity',
  query: `
    SELECT today() AS date, value
    FROM dbt.api_crawlers_data_distinct_projects_total
  `
};

export default metric;
