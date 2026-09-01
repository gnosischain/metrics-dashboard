const metric = {
  id: 'api_governance_electorate_voters_monthly',
  name: 'Voters per GIP Proposal',
  description: 'Monthly median, min and max',
  metricDescription: 'Monthly median, minimum and maximum ballot counts per GIP proposal. Read together with "Median VP per GIP Proposal": the 2022 voter-count peak was an airdrop-farming bubble, so the raw voter decline alone is misleading.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT date, tpl.1 AS series, tpl.2 AS value
    FROM dbt.api_governance_electorate_monthly
    ARRAY JOIN [
      ('Median', toFloat64(median_voters_per_proposal)),
      ('Min', toFloat64(min_voters_per_proposal)),
      ('Max', toFloat64(max_voters_per_proposal))
    ] AS tpl
    ORDER BY date, series
  `,
};
export default metric;
