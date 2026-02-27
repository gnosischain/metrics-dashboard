const metric = {
  id: 'api_esg_energy_consumption_annualised_latest',
  name: 'Annualised Energy Demand',
  description: 'Estimated annualised consumption (in MWh)',
  format: 'formatNumber',
  valueField: 'annual_energy_Mwh_projected',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT * FROM dbt.api_esg_energy_consumption_annualised_latest`,
};

export default metric;