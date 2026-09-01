const metric = {
  id: 'api_hopr_kpi_vpn_exits',
  name: 'GnosisVPN Exit Locations',
  description: 'Production exits',
  metricDescription: 'Production GnosisVPN exit nodes — verified identical to HOPR\'s authoritative client config (gnosis/gnosis_vpn config-jura-prod.toml, 2026-09-01). Dev-environment exits are deliberately excluded.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toFloat64(uniqExact(exit_label)) AS value
    FROM dbt.api_gnosisvpn_exit_activity_daily
  `,
};
export default metric;
