const metric = {
  id: 'api_execution_circles_v2_kpi_total_supply_latest',
  name: 'Total Supply',
  description: 'Network-wide CRC supply',
  metricDescription: `Latest network-wide Circles v2 supply: the sum, across **every** v2 token (personal human CRC and group CRC), of each token's outstanding amount, derived from the negated zero-address (mint minus burn) balance. Reported in **CRC** and **not** demurrage-adjusted — it is the nominal minted-minus-burned supply, not the demurraged balance. Grain is the latest complete day (today's partial day is excluded); the change compares it to the value 7 days earlier.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_total_supply_latest`,
};
export default metric;
