const metric = {
    id: 'example_quantile_bands',
    name: 'Transaction Value Distribution',
    description: 'Daily transaction value quantiles with confidence bands',
    chartType: 'd3QuantileBands',
    isTimeSeries: true,
    enableZoom: true,
    format: 'formatNumber',
    
    d3Config: {
      // Field mappings
      xField: 'date',
      
      // Band configuration - array of objects defining bands
      bands: [
        { lower: 'q05', upper: 'q95', opacity: 0.15, name: '90% Range (5%-95%)' },
        { lower: 'q10', upper: 'q90', opacity: 0.25, name: '80% Range (10%-90%)' },
        { lower: 'q25', upper: 'q75', opacity: 0.35, name: 'IQR (25%-75%)' }
      ],
      
      // Line configuration - array of field names to draw as lines
      lines: ['q50'], // Median line
      
      // Visual configuration
      lineOpacity: 0.9,
      lineStrokeWidth: 3,
      interpolate: 'monotoneX',
      
      // Custom colors for bands (optional)
      bandColors: ['#4dabf7', '#69db7c', '#ffd43b'],
      
      // Custom colors for lines (optional)  
      lineColors: ['#000000'], // Black median line
      
      // Legend and interaction
      enableLegend: true,
      enableTooltip: true,
      legendPosition: 'top',
      legendScrollable: true,
      
      // Custom naming functions (optional)
      bandNamer: (band) => {
        // Custom function to name bands in legend
        return band.name;
      },
      
      lineNamer: (lineField) => {
        // Custom function to name lines in legend
        const nameMap = {
          'q50': 'Median',
          'q25': '25th Percentile',
          'q75': '75th Percentile'
        };
        return nameMap[lineField] || lineField;
      },
      
      // Zoom and pan settings
      enableZoom: true,
      enablePanning: true,
      
      // Universal watermark configuration
      showWatermark: true,
      watermarkPosition: 'bottom-right',
      watermarkSize: 25,
      watermarkOpacity: 0.3
    },
    
    // Example query that returns quantile data
    query: `
        SELECT 
            date,
            q05,
            q10, 
            q25,
            q50,
            q75,
            q90,
            q95
        FROM consensus_validators_balances_dist_daily
        ORDER BY date ASC
    `
  };
  
export default metric;
