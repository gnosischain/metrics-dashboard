// api_bridges__kpi_netflow_7d.js
const metric = {
  id: 'api_bridges_kpi_netflow_7d',
  name: 'Netflow',
  description: 'Last 7 days',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `
    SELECT value, prev_value, change_pct
    FROM dbt.api_bridges_kpi_netflow_7d
  `,
};
export default metric;