const metric = {
  id: 'api_execution_stablecoins_lending_yields_daily',
  name: 'Lending Yields',
  description: 'Daily APY across lending protocols',
  chartType: 'line',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  defaultZoom: {
    start: 60,
    end: 100,
  },
  xField: 'date',
  yField: 'apy_daily',
  seriesField: 'protocol',
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
  query: `SELECT * FROM dbt.api_execution_stablecoins_lending_yields_daily`,
};

export default metric;