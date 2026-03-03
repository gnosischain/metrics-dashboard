const metric = {
  id: 'api_execution_yields_lending_daily',
  name: 'Supply & Borrow APY',
  description: 'Daily rates by token',
  metricDescription: 'Daily supply APY and variable borrow APY for each token on Aave V3. Use the token filter to isolate rate dynamics for a selected asset.',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'apy_type',
  enableFiltering: true,
  labelField: 'token',
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
  query: `SELECT * FROM dbt.api_execution_yields_lending_daily`,
};

export default metric;
