const metric = {
  id: 'overview_gno_supply_daily',
  name: 'GNO Supply Distribution',
  metricDescription: 'Daily GNO supply components by source category. The three bands are mutually exclusive parts of minted supply, so the stack is a true decomposition. The endpoint also carries a derived Total Circ. Supply label (Ethereum Circ. + Gnosis Circ.); it is excluded here because stacking it would double-count the circulating portion — see the GNO Circulating Supply metric.',
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 80, 
    end: 100   
  },
  format: 'formatNumber',
  showTotal: true, 
  
  symbolSize: 2,
  lineWidth: 2,
  
  xField: 'date',
  yField: 'supply',
  seriesField: 'label',

  query: `SELECT * FROM dbt.api_gno_supply_daily
WHERE label IN ('Ethereum Circ. Supply', 'Gnosis Circ. Supply', 'Non-Circ. Supply')`,
};

export default metric;
