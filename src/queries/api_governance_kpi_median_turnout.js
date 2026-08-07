const metric = {
  id: 'api_governance_kpi_median_turnout',
  name: 'Median GIP turnout',
  description: 'Across all scored GIP ballots',
  metricDescription: `Median of per-GIP turnout ratios (voting power cast / eligible supply) over all
scored GIP proposals. Unit: percent. Typical values are low single digits — that is the
base rate for token-weighted DAO votes on this space, not a chart bug.

Source: \`dbt.api_governance_turnout_latest\`.`,
  chartType: 'numberDisplay',
  variant: 'compact',
  format: 'formatPercentage',
  valueField: 'value',
  query: `
    SELECT round(median(turnout) * 100, 2) AS value
    FROM dbt.api_governance_turnout_latest
    WHERE turnout IS NOT NULL
  `,
};

export default metric;
