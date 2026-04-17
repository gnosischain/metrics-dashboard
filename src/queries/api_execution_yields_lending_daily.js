const metric = {
  id: 'api_execution_yields_lending_daily',
  name: 'Supply & Borrow APY',
  description: 'Daily rates by token, split by lending protocol',
  metricDescription:
    'Daily supply APY and variable borrow APY for each lending reserve on ' +
    'Gnosis Chain, for both Aave V3 and SparkLend. Select a token to isolate ' +
    'its rate dynamics — up to 4 lines render (Aave Supply, Aave Borrow, Spark ' +
    'Supply, Spark Borrow).',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  enableFiltering: true,
  // labelField intentionally set to 'protocol' so this widget provides the tab-level
  // Protocol dropdown options (MetricGrid picks the first metric with
  // labelField === secondaryGlobalFilterField as the options source). Token filter is
  // still received via globalFilterField below and applied to the query.
  labelField: 'protocol',
  globalFilterField: 'token',
  applySecondaryGlobalFilter: true,
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  smooth: true,
  symbolSize: 4,
  lineWidth: 2,
  yAxis: {
    name: '%',
    nameLocation: 'middle',
    nameRotate: 90,
    nameGap: 60,
    nameTextStyle: { fontWeight: 500 }
  },
  grid: {
    left: 70
  },
  query: `
    SELECT
      date,
      token,
      token_class,
      label AS protocol,
      apy_type,
      concat(label, ' · ', apy_type) AS series,
      value
    FROM dbt.api_execution_lending_daily
  `,
};

export default metric;
