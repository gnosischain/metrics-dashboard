const metric = {
  id: 'api_execution_gpay_cashback_dist_weekly',
  name: 'Cashback Distribution',
  description: 'Weekly per-user cashback percentiles',
  metricDescription: 'Percentile bands of weekly per-user cashback amounts. The median line shows the typical user, and the shaded bands reveal how spread out users are — narrow bands mean even distribution, wide bands mean concentration.',
  chartType: 'quantileBands',
  isTimeSeries: true,
  enableZoom: true,

  defaultZoom: {
    start: 50,
    end: 100,
  },

  xField: 'date',
  unitFilterField: 'unit',

  bands: [
    { lower: 'q05', upper: 'q95', opacity: 0.15, name: '90% Range (5%-95%)' },
    { lower: 'q10', upper: 'q90', opacity: 0.25, name: '80% Range (10%-90%)' },
    { lower: 'q25', upper: 'q75', opacity: 0.35, name: 'IQR (25%-75%)' },
  ],

  lines: ['q50', 'average'],

  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'monotoneX',

  bandColors: ['#4dabf7', '#69db7c', '#ffd43b'],
  lineColors: ['#000000', '#004525ff'],

  enableLegend: true,
  enableTooltip: true,
  legendPosition: 'top',
  legendScrollable: true,

  showWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkSize: 25,
  watermarkOpacity: 0.3,

  yAxis: {
    type: 'log',
    logBase: 10, // Optional: specify the logarithm base (default is 10)
    min: 1e-4,//'dataMin', // Optional: set minimum value
    max: 1//'dataMax', // Optional: set maximum value
  },

  query: `
    SELECT date, unit, q05, q10, q25, q50, q75, q90, q95, average
    FROM dbt.api_execution_gpay_cashback_dist_weekly
  `,
};
export default metric;
