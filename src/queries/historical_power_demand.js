const metric = {
  id: 'historical_power_demand',
  name: 'Network Power Demand',
  description: 'Daily power (kW) demand from the network',
  format: 'formatNumber',
  labelField: 'country',
  chartType: 'stackedBar',
  query: `SELECT date, power/POWER(10,3) AS value, country FROM dbt.esg_power_consumption_top10 ORDER BY date, country`
};

export default metric;