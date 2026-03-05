const metric = {
  id: 'api_execution_yields_lending_daily',
  name: 'Aave V3 Lending & Borrow APY',
  description: 'Daily lending and borrow APY',
  metricDescription: 'Daily lending APY and variable borrow APY by token and protocol. Token filter isolates rate dynamics for a selected asset.',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  defaultZoom: {
    start: 60,
    end: 100,
  },
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
