const metric = {
  id: 'overview_esg',
  name: 'Annualised CO2e',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.5rem', 
  fontSize: '3rem',    
  query: `SELECT  CONCAT(toString(round(annual_co2_tonnes_projected)), 't') AS value FROM dbt.api_esg_carbon_emissions_annualised_latest`
};

export default metric;