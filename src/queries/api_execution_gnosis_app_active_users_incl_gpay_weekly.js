const metric = {
  id: 'api_execution_gnosis_app_active_users_incl_gpay_weekly',
  name: 'Active Users',
  description: 'Activity by behavioral cohort.',
  metricDescription: `**Includes Gnosis Pay card-wallet activity** (runs above the in-app WAU tile). Weekly Active Users of the Gnosis App — distinct addresses that took at least one real action in the week (the current incomplete week is excluded; weeks start Monday). A user is **Active** via ANY of:\n\n- a **Circles** action — register, personal mint, trust, invite, profile update, or a relayed fee/module event;\n- a **CoW swap** (signed or filled);\n- a **Gnosis Pay top-up** (crypto deposit into the card wallet);\n- a **marketplace buy**;\n- a **token-offer claim**;\n- **any Gnosis Pay card-wallet transaction** — card spend, withdrawal, off-ramp or fiat top-up — attributed to the safe's Gnosis App owner, so a cardholder who only spends and never opens the app still counts (system-side reversals/cashback are excluded).\n\nThe synthetic onboarding marker alone never makes a user active. Bars stack **New** (first week the user is ever seen), **Returning** (active this week and the immediately prior week) and **Reactivated** (active again after a ≥4-week gap); the line is total **Active**, which also includes users outside those three buckets, so it sits above the stack. Use the resolution toggle for the Daily and Monthly grains.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  format: 'formatNumber',
  seriesColorsByName: { New: '#7B3FE4', Returning: '#A78BFA', Reactivated: '#FF8A3D' },
  lineOverlayField: 'active',
  lineOverlayLabel: 'Active',
  lineOverlayColor: '#2E1065',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT * FROM (
      SELECT toDate(week) AS date, 'New'         AS label, new_users         AS value, active_users AS active FROM dbt.api_execution_gnosis_app_active_users_incl_gpay_weekly
      UNION ALL SELECT toDate(week), 'Returning',   returning_users,   active_users FROM dbt.api_execution_gnosis_app_active_users_incl_gpay_weekly
      UNION ALL SELECT toDate(week), 'Reactivated', reactivated_users, active_users FROM dbt.api_execution_gnosis_app_active_users_incl_gpay_weekly
    )
    ORDER BY date ASC, label ASC
  `,
};

export default metric;
