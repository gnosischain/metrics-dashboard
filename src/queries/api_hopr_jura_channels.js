const metric = {
  id: 'api_hopr_jura_channels',
  name: 'Jura Channels',
  description: 'Open vs total',
  metricDescription: 'Payment channels on jura from the protocol snapshot: currently open vs all-ever (including closed). Forward-only feed from 2026-08-18.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT date, tpl.1 AS series, tpl.2 AS value
    FROM dbt.api_hopr_protocol_params_daily
    ARRAY JOIN [
      ('Open', toFloat64(channels_open)),
      ('Total (incl. closed)', toFloat64(channels_total))
    ] AS tpl
    WHERE network = 'jura'
    ORDER BY date, series
  `,
};
export default metric;
