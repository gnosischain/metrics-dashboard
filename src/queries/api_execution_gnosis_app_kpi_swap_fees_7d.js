const metric = {
  id: 'api_execution_gnosis_app_kpi_swap_fees_7d',
  name: 'Swap Fees (7d)',
  description: 'Protocol fee revenue in last 7 days',
  metricDescription: 'CoW protocol fee revenue (USD) from filled Gnosis App swaps in the last 7 full days, with WoW pct change.',
  chartType: 'numberDisplay',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_swap_fees_7d`,
};
export default metric;
