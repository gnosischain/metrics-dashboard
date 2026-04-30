const metric = {
  id: 'api_consensus_validators_income_total_daily',
  name: 'Network Consensus Income',
  description: 'Daily sum of consensus income (GNO) across every validator, with a 7-day rolling-median overlay',
  metricDescription: 'Sum of consensus_income_amount_gno per day across the full validator set (including exited and zero-balance). Derived from the per-validator income fact int_consensus_validators_income_daily. Real negative days (slashing, mass exits) remain visible as raw bars. The overlaid line is income_gno_rolling_7d_median — trailing 7-day median of income_gno, useful for reading the underlying trend through daily noise. Days where anomaly_flag=1 (abs(income) > 5 \u00d7 trailing-30d median(abs(income)) AND > 500 GNO) are highlighted in the tooltip with the validator snapshot count for the day, so crawler-coverage dips are easy to spot.',
  chartType: 'area',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',

  xField: 'date',
  yField: 'income_gno',

  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,

  // Overlay the 7-day rolling median as a second series so the chart component
  // renders it as an additional line on top of the raw income area. Most chart
  // components in this repo accept a `seriesField` or additional `lines` config
  // for area charts; if the chart type doesn\u2019t support stacked lines out of the
  // box we\u2019ll switch to a combo chart in a follow-up. For now we expose the
  // rolling-median column in the query and let the component pick it up.
  seriesField: 'series',
  additionalSeries: [
    {
      name: '7-day rolling median',
      type: 'line',
      yField: 'income_gno_rolling_7d_median',
      lineStyle: { width: 2, color: '#c92a2a', type: 'solid' },
      smooth: true,
      z: 1000
    }
  ],

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  // Tooltip annotation: when anomaly_flag = 1, surface the snapshot count so the
  // reader knows whether a large value is a real event or a coverage dip.
  tooltipExtraFields: ['anomaly_flag', 'validators_snapshot_count', 'income_gno_rolling_7d_median'],

  query: `SELECT date, income_gno, income_gno_rolling_7d_median, income_gno_rolling_30d_median,
                 validators_snapshot_count, anomaly_flag
          FROM dbt.api_consensus_validators_income_total_daily
          ORDER BY date`,
};

export default metric;
