const metric = {
  id: 'api_governance_activity_monthly',
  name: 'Governance activity',
  description: 'Proposals created, votes cast, and unique voters per month',
  metricDescription: `Monthly Snapshot activity on \`gnosis.eth\` in long form: proposals created, votes cast, and unique voters that month.

**Do not read the vote-count line alone.** 2022 was an airdrop-farming bubble; raw votes fell sharply afterward while voting power per GIP stayed material. Pair this with the Electorate chart (people vs capital) before drawing conclusions about engagement.

Source: \`dbt.api_governance_activity_monthly\`.`,
  chartType: 'line',
  format: 'formatNumber',
  yField: 'value',
  seriesField: 'label',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    SELECT
      date,
      multiIf(
        metric = 'proposals_created', 'Proposals created',
        metric = 'votes_cast', 'Votes cast',
        metric = 'unique_voters', 'Unique voters',
        metric
      ) AS label,
      toFloat64(value) AS value
    FROM dbt.api_governance_activity_monthly
    WHERE date BETWEEN '{from}' AND '{to}'
    ORDER BY date, label
  `,
};

export default metric;
