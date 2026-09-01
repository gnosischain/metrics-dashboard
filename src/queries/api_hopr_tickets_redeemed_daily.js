const metric = {
  id: 'api_hopr_tickets_redeemed_daily',
  name: 'Tickets Redeemed',
  description: 'Daily, cover traffic split out',
  metricDescription: 'Tickets redeemed per day, split honestly: dufour cover-traffic (HOPR\'s own reward schedule — nearly all dufour volume), dufour organic (~zero), and jura (organic only). The cover-traffic series must never be summed into "usage".',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT date, concat(network, if(is_cover_traffic = 1, ' (cover traffic)', ' (organic)')) AS series, toFloat64(sum(tickets_redeemed)) AS value
    FROM dbt.api_hopr_channel_activity_daily
    WHERE network IN ('dufour', 'jura')
    GROUP BY date, series
    ORDER BY date, series
  `,
};
export default metric;
