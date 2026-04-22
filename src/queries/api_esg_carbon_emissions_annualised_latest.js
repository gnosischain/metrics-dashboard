const metric = {
  id: 'api_esg_carbon_emissions_annualised_latest',
  name: 'Annualised Carbon Emissions',
  description: 'Annualised',
  metricDescription: 'Estimated annualised CO2e emissions for Gnosis Chain, reported in tCO2e.',
  format: 'formatNumber',
  valueField: 'annual_co2_tonnes_projected',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT * FROM dbt.api_esg_carbon_emissions_annualised_latest`,
};

export default metric;