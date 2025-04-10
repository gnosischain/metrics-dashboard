const metric = {
    id: 'daily_co2_emissions',
    name: 'Daily CO2 Network Emmisions',
    description: 'Daily tCO2 emissions from the network',
    format: 'formatNumber',
    chartType: 'line',
    color: '#EA4335',
    query: `SELECT date, co2_emissions AS value FROM dbt.esg_carbon_emissions ORDER BY date`
  };
  
  export default metric;