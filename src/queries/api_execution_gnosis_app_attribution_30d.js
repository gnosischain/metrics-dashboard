const metric = {
  id: 'api_execution_gnosis_app_attribution_30d',
  name: 'Attribution by Model (30d)',
  description: 'Conversion credit by touchpoint',
  metricDescription: `Multi-touch attribution: how much conversion credit each touchpoint (\`event_kind\`, e.g. \`chain.swap_filled\`, \`mp.pageview\`, \`chain.onboard\`) earns for driving Gnosis App conversions, under four models — **first-touch**, **last-touch**, **linear** (a conversion's credit split evenly across its touch kinds), and **time-decay** (7-day half-life, recent touches weighted more). For each conversion only touchpoints in the **30 days before it** are eligible (the conversion's own event kind is excluded) and every conversion distributes a total credit of 1.0 across its touch kinds. The values here **sum those credits over all conversions in the trailing 180 days** (and across every \`conversion_kind\`), so \`30d\` is the per-conversion look-back window, not the reporting range; the chart shows the top 10 touchpoints by \`linear\` credit. Comparing the bars shows how differently each model rewards the same touchpoint.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  enableZoom: true,
  xField: 'event_kind',
  yField: 'value',
  seriesField: 'model',
  format: 'formatNumber',
  query: `
    SELECT event_kind, model, sum(credit) AS value
    FROM (
      SELECT event_kind, 'First touch' AS model, first_touch      AS credit FROM dbt.api_execution_gnosis_app_attribution_30d
      UNION ALL SELECT event_kind, 'Last touch',   last_touch       FROM dbt.api_execution_gnosis_app_attribution_30d
      UNION ALL SELECT event_kind, 'Linear',       linear           FROM dbt.api_execution_gnosis_app_attribution_30d
      UNION ALL SELECT event_kind, 'Time decay',   time_decay_hl_7d FROM dbt.api_execution_gnosis_app_attribution_30d
    )
    WHERE event_kind IN (
      SELECT event_kind FROM dbt.api_execution_gnosis_app_attribution_30d
      GROUP BY event_kind ORDER BY sum(linear) DESC LIMIT 10
    )
    GROUP BY event_kind, model
    ORDER BY event_kind, model
  `,
};
export default metric;
