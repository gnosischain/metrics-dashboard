const metric = {
  id: 'api_dao_treasury_holdings_by_class_ts',
  name: 'Holdings by Asset Class',
  description: 'Daily USD value, stacked by class',
  metricDescription: 'Daily total GnosisDAO holdings on Gnosis Chain (wallet + lending), stacked by asset class: GNO, Stablecoins, RWA, ETH, BTC, Other.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrencyCompact',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  smooth: true,
  symbol: 'none',
  symbolSize: 0,
  lineWidth: 2,
  areaOpacity: 0.7,
  legendTokenIcons: false,

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_dao_treasury_holdings_by_class_ts`,
};
export default metric;
