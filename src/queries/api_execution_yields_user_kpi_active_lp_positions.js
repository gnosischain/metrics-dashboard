const metric = {
  id: 'api_execution_yields_user_kpi_active_lp_positions',
  name: 'Active LP Positions',
  description: 'In-range / out-of-range',
  metricDescription: 'Count of LP positions with remaining liquidity. Shows in-range and out-of-range breakdown for V3 concentrated liquidity positions.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  subtitleTemplate: function(row) {
    if (!row) return '';
    const inRange = Number(row.in_range_positions || 0);
    const outRange = Number(row.out_of_range_positions || 0);
    const parts = [];
    if (inRange > 0) parts.push(`${inRange} in-range`);
    if (outRange > 0) parts.push(`${outRange} out-of-range`);
    return parts.join(' · ') || '';
  },
  query: `
    SELECT wallet_address, active_lp_positions AS value, in_range_positions, out_of_range_positions
    FROM dbt.api_execution_yields_user_kpis
  `,
};

export default metric;
