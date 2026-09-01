const metric = {
  id: 'api_hopr_channels_opened_closed_daily',
  name: 'Channels Opened / Closed',
  description: 'Daily, organic only',
  metricDescription: 'Channel opens and closes per day, excluding cover traffic — on dufour, cover traffic (HOPR\'s own staking-rewards schedule) is essentially all activity, so the unfiltered view would plot a rewards programme as usage. Jura emits organic rows only.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT date, concat(network, ' ', tpl.1) AS series, tpl.2 AS value
    FROM dbt.api_hopr_channel_activity_daily
    ARRAY JOIN [
      ('opened', toFloat64(channels_opened)),
      ('closed', toFloat64(channels_closed))
    ] AS tpl
    WHERE network IN ('dufour', 'jura') AND is_cover_traffic = 0
    ORDER BY date, series
  `,
};
export default metric;
