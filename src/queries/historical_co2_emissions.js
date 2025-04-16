const metric = {
    id: 'historical_co2_emissions',
    name: 'Network CO2 Emissions',
    description: 'Daily tCO2 emissions from the network',
    format: 'formatNumber',
    chartType: 'line',
    color: '#EA4335',
    query: `SELECT date, co2_emissions AS value FROM dbt.esg_carbon_emissions ORDER BY date`
  };
  
  export default metric;