const metric = {
  id: 'api_execution_gnosis_app_activity_by_action_weekly',
  name: 'Activity by Action',
  description: 'Weekly actions by kind',
  metricDescription: `Weekly Gnosis App on-chain actions broken down by \`activity_kind\`: CoW swaps (\`swap_signed\` = order signed, \`swap_filled\` = order settled on-chain), Gnosis Pay \`topup\`, \`marketplace_buy\`, \`token_offer_claim\`, and Circles heuristic actions (\`circles_trust\`, \`circles_personal_mint\`, \`circles_register_human\`, \`circles_invite_human\`, \`circles_fee\`, etc.). Toggle between **Events** (\`n_events\`, total actions) and **Unique Users** (\`n_users\`, distinct addresses per kind that week). The \`onboard\` first-seen marker is excluded and the current incomplete week is dropped; weeks start Monday.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_events',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  valueModeOptions: [
    { key: 'n_events', label: 'Events',      valueField: 'n_events', format: 'formatNumber' },
    { key: 'n_users',  label: 'Unique Users', valueField: 'n_users',  format: 'formatNumber' },
  ],
  defaultValueMode: 'n_events',
  query: `
    SELECT toDate(week) AS date, activity_kind AS label, n_events, n_users
    FROM dbt.api_execution_gnosis_app_activity_by_action_weekly
    WHERE activity_kind != 'onboard'
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
