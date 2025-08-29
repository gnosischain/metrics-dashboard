const metric = {
  id: 'api_esg_cif_network_vs_countries_daily',
  name: 'Carbon Intensity Factor Network vs Countries',
  description: 'Daily Carbon Intensity Factor (CIF) in gCO2e/kWh',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  
  // NEW: Default zoom configuration
  defaultZoom: {
    start: 70, // Start at 70% (showing last 30%)
    end: 100   // End at 100%
  },
  
  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'carbon_intensity_gco2_kwh', 
  seriesField: 'entity_code',
  
  // Optional chart styling
  smooth: true,
  symbolSize: 4,
  lineWidth: 1,
  
  query: `SELECT * FROM dbt.api_esg_cif_network_vs_countries_daily`,
};

export default metric;