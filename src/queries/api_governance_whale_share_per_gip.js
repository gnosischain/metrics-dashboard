const metric = {
  id: 'api_governance_whale_share_per_gip',
  name: 'Whale Share per GIP',
  description: 'Top 1 / 5 / 10 voters',
  metricDescription: 'Share of each GIP ballot\'s total voting power held by its largest 1, 5 and 10 voters, plotted at proposal creation time (one point per GIP; zero-VP ballots excluded). The tiers are cumulative: the top-5 line includes the top-1 voter.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatPercentage',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT toDate(created_at) AS date, tpl.1 AS series, round(tpl.2 * 100, 1) AS value
    FROM dbt.api_governance_whale_concentration
    ARRAY JOIN [
      ('Top 1', toFloat64(ifNull(top1_share, 0))),
      ('Top 5', toFloat64(ifNull(top5_share, 0))),
      ('Top 10', toFloat64(ifNull(top10_share, 0)))
    ] AS tpl
    WHERE is_gip = 1 AND total_vp > 0
    ORDER BY date, series
  `,
};
export default metric;
