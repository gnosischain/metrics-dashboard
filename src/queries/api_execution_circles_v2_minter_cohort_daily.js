const metric = {
  id: 'api_execution_circles_v2_minter_cohort_daily',
  name: 'Minter Cohort Distribution',
  description: 'Avatars by 14-day mint coverage cohort',
  metricDescription: `Daily count of Circles v2 personal minters, split into cohorts by how fully they minted. Only avatars that minted on **every one** of the trailing 14 days (\`mint_days_14dw = 14\`) are included; each is bucketed by its actual 14-day mint total (\`mint_14dw\`) as a share of **336 CRC** — the theoretical maximum (24 CRC/day over 14 days). Buckets: \`<1%\`, \`[1%, 20%[\`, \`[20%, 40%[\`, \`[40%, 60%[\`, \`[60%, 80%[\`, \`+80%\`. Blacklisted avatars (per the \`circles_blacklisted\` snapshot) are excluded, and the current incomplete day is dropped.`,
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
