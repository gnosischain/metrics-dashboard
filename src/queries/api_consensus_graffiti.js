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
  
  query: `
    SELECT * FROM api_consensus_graffiti_cloud
  `
};

export default metric;