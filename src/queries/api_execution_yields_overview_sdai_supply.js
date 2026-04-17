const metric = {
  id: 'api_execution_yields_overview_sdai_supply',
  name: 'Savings xDAI Supply',
  description: 'TVL on Gnosis Chain',
  metricDescription:
    'Total value locked in the Savings xDAI vault (0xaf20…3701). Not all bridged ' +
    'stablecoin supply is deposited — the bridge concentrates yield in Savings ' +
    'xDAI depositors only, so this figure measures active participants, not the ' +
    'full bridged supply.',
  format: 'formatValue',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT value, change_pct FROM dbt.api_execution_yields_overview_sdai_supply`,
};

export default metric;
