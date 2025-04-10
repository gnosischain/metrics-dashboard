const metric = {
  id: 'daily_electricity_demand',
  name: 'Network Electricity Demand',
  description: 'Daily electricity (MWh) demand from the network',
  format: 'formatNumber',
  chartType: 'line',
  color: '#EA4335',
  query: `SELECT date, energy AS value FROM dbt.esg_carbon_emissions ORDER BY date`
};

export default metric;