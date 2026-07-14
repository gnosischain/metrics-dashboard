const metric = {
  id: 'api_execution_circles_v2_weau_weekly',
  name: 'Economically Active Avatars (weekly)',
  description: 'Weekly avatars earning CRC rewards (ecosystem-wide)',
  metricDescription: `Weekly count of **economically active Circles avatars** (WEAU) — distinct avatars that *earned* a CRC reward in the week, using the ecosystem-wide, Circles-first definition (\`earning_kind = 'any'\`): an avatar counts if it received **gCRC cashback** or a **CRC inviter fee** that week, regardless of which app or wallet initiated the activity. This is stricter than active-user counts (which include any action) — it captures avatars actually capturing value. Toggle **Ecosystem-wide** (\`avatars\`, all such earners on Gnosis Chain) versus **In-app (Gnosis App)** (\`avatars_in_app_tx\`, the subset whose earning event arrived through a Gnosis App relayer transaction), so the gap between the two lines is the share of Circles economic activity that flows through the Gnosis App. Weeks are Monday-aligned (UTC) and the current incomplete week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'avatars',
  format: 'formatNumber',
  valueModeOptions: [
    { key: 'avatars',           label: 'Ecosystem-wide',      valueField: 'avatars',           format: 'formatNumber' },
    { key: 'avatars_in_app_tx', label: 'In-app (Gnosis App)', valueField: 'avatars_in_app_tx', format: 'formatNumber' },
  ],
  defaultValueMode: 'avatars',
  query: `
    SELECT toString(week) AS date, avatars, avatars_in_app_tx
    FROM dbt.api_execution_circles_v2_economically_active_avatars_weekly
    WHERE earning_kind = 'any'
    ORDER BY week
  `,
};
export default metric;
