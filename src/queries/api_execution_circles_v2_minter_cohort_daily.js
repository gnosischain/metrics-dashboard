const metric = {
  id: 'api_execution_circles_v2_minter_cohort_daily',
  name: 'Minter Cohort Distribution',
  description: 'Avatars by 14-day mint coverage cohort',
  metricDescription: 'Daily distribution of Circles v2 avatars (mint_days_14dw = 14) bucketed by share of the 336 CRC theoretical maximum minted in the last 14 days. Blacklisted avatars excluded.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'cnt',
  seriesField: 'cohort',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  // ORDER BY cohort_order in the SQL ensures consistent low→high stacking
  // for the area chart's series rendering.
  query: `
    SELECT date, cohort, cohort_order, cnt
    FROM dbt.api_execution_circles_v2_minter_cohort_daily
    ORDER BY date, cohort_order
  `,
};
export default metric;
