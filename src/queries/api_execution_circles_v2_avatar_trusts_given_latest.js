const metric = {
  id: 'api_execution_circles_v2_avatar_trusts_given_latest',
  name: 'Trusts Given',
  metricDescription: 'Outgoing trust relationships the avatar has extended to other Circles avatars.',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'trusts_given_count',
  format: 'formatNumber',

  query: `
    SELECT avatar, trusts_given_count, trusts_received_count
    FROM dbt.api_execution_circles_v2_avatar_trusts_summary
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
