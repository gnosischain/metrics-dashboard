const metric = {
  id: 'api_esg_carbon_emissions_annualised_latest',
  name: 'Annualised Carbon Emissions',
  description: 'Estimated annualised CO2e (in tCO2e)',
  format: 'formatNumber',
  valueField: 'annual_co2_tonnes_projected',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT * FROM dbt.api_esg_carbon_emissions_annualised_latest`,
};

export default metric;