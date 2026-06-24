const metric = {
  id: 'api_execution_yields_lending_lenders_count_7d',
  name: 'Active Lenders',
  description: 'Current',
  metricDescription: 'Unique wallets currently holding a supply balance worth more than $0.01 (sub-cent dust excluded) in a Gnosis lending market (Aave V3 or SparkLend). Stock measure — counted at the latest available day. Change % compares to the same wallet set 7 days earlier.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: false,
  applySecondaryGlobalFilter: true,
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  // The mart view returns one row per protocol (Aave V3 / SparkLend / ALL). The tab
  // always auto-selects a protocol, so filterField3=protocol=<...> narrows to a single
  // row server-side and the card renders that protocol's count.
  query: `SELECT token, protocol, value, change_pct FROM dbt.api_execution_lending_lenders_count_7d`,
};

export default metric;
