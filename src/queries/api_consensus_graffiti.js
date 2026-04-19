const metric = {
  id: 'api_consensus_graffiti',
  name: 'Graffiti Word Cloud',
  description: 'Top 50 graffiti messages from validators',
  metricDescription: 'Top validator graffiti messages weighted by frequency. Use the label filter to isolate message sources and themes.',
  chartType: 'wordcloud',
  format: 'formatNumber',
  
  // Data field mapping
  textField: 'graffiti',
  valueField: 'value',
  categoryField: 'label', // This enables labelField filtering
  
  // Filtering support (labelField)
  enableFiltering: true,
  labelField: 'label', // Enables dropdown filtering by source type
  
  // Visual configuration
  shape: 'circle',
  sizeRange: [14, 80],
  rotationRange: [-45, 45],
  rotationStep: 15,
  colorMode: 'random', 
  showLegend: false,
  
  // Data processing
  minWordLength: 4,
  maxWords: 80,
  excludeWords: ['this', 'that', 'with', 'from', 'they', 'were', 'been', 'have', 'their'],
  normalizeCase: true,
  
  // Styling
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: 'normal',
  
  // Tooltip customization
  showTooltip: true,
  customTooltipFields: ['context', 'last_seen'],
  
  // Animation
  layoutAnimation: true,
  
  // Graffiti is a fixed 32-byte beacon chain field, null-padded. ClickHouse
  // returns the raw UInt8 bytes including \0 terminators — trim them here so
  // echarts-wordcloud doesn't receive strings with embedded NULs (which render
  // as blank glyphs and can silently break the layout).
  query: `
    SELECT
      label,
      trim(BOTH '\\0' FROM graffiti) AS graffiti,
      value
    FROM dbt.api_consensus_graffiti_cloud
    WHERE trim(BOTH '\\0' FROM graffiti) != ''
  `
};

export default metric;