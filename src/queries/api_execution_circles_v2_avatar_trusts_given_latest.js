const metric = {
  id: 'api_execution_circles_v2_avatar_trusts_given_latest',
  name: 'Trusts Given',
  description: 'Outgoing trust relationships',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'trusts_given_count',
  format: 'formatNumber',

  query: `
    SELECT avatar, trusts_given_count, trusts_received_count
    FROM dbt.api_execution_circles_v2_avatar_trusts_summary
  `,
};

export default metric;
