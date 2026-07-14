const metric = {
  id: 'api_execution_circles_v2_group_explorer_size_daily',
  name: 'Members (daily)',
  metricDescription: `Daily count of the group's members. A **member** is an address on the group's outgoing trust list — an address the group trusts (the Circles v2 group-membership semantic). Reconstructed from the full history of trust intervals (revoked edges are retained), so each day reflects the members active *that day* rather than being back-projected from today's snapshot; a revoked member drops off on its revoke date. Distinct trustees are counted per day, and the latest incomplete day (today) is excluded.`,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  globalFilterField: 'group_address',
  xField: 'date',
  yField: 'value',
  format: 'formatNumber',
  query: `
    SELECT date, n_members AS value
    FROM dbt.api_execution_circles_v2_group_size_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};
export default metric;
