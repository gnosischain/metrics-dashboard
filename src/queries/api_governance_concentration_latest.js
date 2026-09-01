const metric = {
  id: 'api_governance_concentration_latest',
  name: 'Voting-Power Concentration',
  description: 'Top 10 / 20 / 50, latest',
  metricDescription: 'Latest concentration snapshot: share of the total held by the top 10, 20 and 50 members of each population. The tiers are cumulative (Top 20 contains Top 10), so bars are grouped side by side, never stacked. Headline contrast: the top-10 voters hold about 67% of all VP ever cast but cast only about 2% of ballots.',
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  format: 'formatPercentage',
  xField: 'population',
  yField: 'value',
  seriesField: 'tier',
  query: `
    SELECT
      multiIf(
        population = 'voters_by_vp', 'Voters by VP',
        population = 'voters_by_votes', 'Voters by ballots',
        population = 'delegates_by_delegators', 'Delegates by delegators',
        population
      ) AS population,
      concat('Top ', toString(tier)) AS tier,
      round(toFloat64(ifNull(share, 0)) * 100, 1) AS value
    FROM dbt.api_governance_concentration_latest
    ORDER BY population, tier
  `,
};
export default metric;
