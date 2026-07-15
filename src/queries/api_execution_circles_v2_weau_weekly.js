const metric = {
  id: 'api_execution_circles_v2_weau_weekly',
  name: 'Economically Active Avatars (weekly)',
  description: 'Weekly avatars earning CRC rewards (ecosystem-wide)',
  metricDescription: `Weekly count of **economically active Circles avatars** — distinct avatars that *earned* a CRC reward in the week (ecosystem-wide, Circles-first; \`earning_kind = 'any'\`): an avatar counts if it received **gCRC cashback** or a **CRC inviter fee** (≥ 1 unit) that week, regardless of which app or wallet initiated it. Toggle **Ecosystem-wide** (\`avatars\`, all such earners on Gnosis Chain) versus **In-app (Gnosis App)** (\`avatars_in_app_tx\`) — the Gnosis-App-attributed subset: **cashback received by a Gnosis App member**, or an **inviter fee where ≥ 1 fee that week came through a Gnosis App relayer tx**. That In-app line is the **same in-app earner base the Gnosis App WEAU metric is built on**; WEAU narrows it further to app-*active* users (WAU ∩ earners), so In-app ≥ WEAU. Weeks are Monday-aligned (UTC) and the current incomplete week is excluded.`,
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
