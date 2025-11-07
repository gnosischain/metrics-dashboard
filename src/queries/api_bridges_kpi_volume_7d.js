// api_bridges__kpi_volume_7d.js
const metric = {
  id: 'api_bridges_kpi_volume_7d',
  name: 'Volume',
  description: 'Last 7 days',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `
    SELECT value, prev_value, change_pct
    FROM dbt.api_bridges_kpi_volume_7d
  `,
};
export default metric;