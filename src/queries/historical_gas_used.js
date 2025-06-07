const metric = {
  id: 'historical_gas_used',
  name: 'EL Gas Used',
  description: 'Daily gas used in Gwei',
  format: 'formatNumber',
  chartType: 'd3StackedArea',
  isTimeSeries: true,
  enableZoom: true,
  
  d3Config: {
    // Field mappings
    xField: 'date',
    yField: 'value',
    seriesField: 'transaction_type',
    
    // Stacked area specific settings
    stacked: true,
    multiSeries: true,
    opacity: 0.8,
    strokeWidth: 1, 
    interpolate: 'monotoneX',
    
    // Visual settings
    enableLegend: true,
    enableTooltip: true,
    legendPosition: 'top',
    legendScrollable: true,
    
  },

  query: `SELECT date, transaction_type, gas_used/POWER(10,9) AS value FROM dbt.execution_txs_info_daily WHERE success = 1 ORDER BY date, transaction_type`,
};

export default metric;

