const metric = {
  id: 'historical_el_client_distribution',
  name: 'EL Client Distribution',
  description: 'Distribution of block production per client',
  format: 'formatNumber',
  chartType: 'd3StackedArea',
  isTimeSeries: true,
  enableZoom: true,
  
  d3Config: {
    // Field mappings - make sure these match your data structure
    xField: 'date',
    yField: 'value',
    seriesField: 'client',
    
    // Stacked area specific settings
    stacked: true,
    multiSeries: true,
    opacity: 0.8,
    strokeWidth: 1, // Add some stroke for definition
    interpolate: 'monotoneX',
    
    // Visual settings
    enableLegend: true,
    enableTooltip: true,
    legendPosition: 'top', // Can be 'top' or 'right'
    legendScrollable: true, // Enable scrolling for many legend items
    
  },

  query: `SELECT date, client, value AS value FROM dbt.execution_blocks_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;