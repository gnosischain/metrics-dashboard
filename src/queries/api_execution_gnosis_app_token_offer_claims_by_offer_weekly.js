const metric = {
  id: 'api_execution_gnosis_app_token_offer_claims_by_offer_weekly',
  name: 'Claims by Offer',
  description: 'Weekly — claims stacked by offer instance',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_claims',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  query: `
    SELECT toStartOfWeek(date, 1) AS date,
           concat(substring(offer_address, 1, 10), '…',
                  coalesce(concat(' ', offer_token_symbol), '')) AS label,
           sum(n_claims) AS n_claims
    FROM dbt.api_execution_gnosis_app_token_offer_claims_by_offer_daily
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
