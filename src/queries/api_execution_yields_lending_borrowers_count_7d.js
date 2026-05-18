const metric = {
  id: 'api_execution_yields_lending_borrowers_count_7d',
  name: 'Borrowers',
  description: 'Last 7 days',
  metricDescription: 'Unique wallets that borrowed at least one asset across Gnosis lending markets (Aave V3 and SparkLend) in the last 7 days. Counted once across protocols.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: false,
  applySecondaryGlobalFilter: true,
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs prior 7 days'
  },
  // See lenders_count_7d header — tab auto-selects protocol so filterField3 narrows.
  query: `SELECT token, protocol, value, change_pct FROM dbt.api_execution_lending_borrowers_count_7d`,
};

export default metric;
