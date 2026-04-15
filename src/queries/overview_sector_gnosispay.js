const metric = {
  id: 'overview_sector_gnosispay',
  name: 'Gnosis Pay',
  kpiLabel: 'Monthly Active Users',
  chartType: 'kpi',
  valueField: 'value',
  format: 'formatNumberCompact',
  linkTo: 'gnosispay',
  query: `
    SELECT date, value FROM (
      SELECT toDate(month) AS date, mau AS value
      FROM dbt.api_execution_gpay_kpi_monthly
      ORDER BY month DESC
      LIMIT 6
    )
    ORDER BY date ASC
  `
};

export default metric;
