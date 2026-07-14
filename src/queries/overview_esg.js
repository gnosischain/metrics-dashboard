const metric = {
  id: 'overview_esg',
  name: 'Annualised CO₂e (t)',
  valueField: 'value',
  chartType: 'number',
  format: 'formatNumberCompact',
  metricDescription: 'Projected annual carbon emissions of Gnosis Chain, in tonnes of CO₂-equivalent.',
  query: `SELECT round(annual_co2_tonnes_projected) AS value FROM dbt.api_esg_carbon_emissions_annualised_latest`
};

export default metric;
