const metric = {
  id: 'api_execution_circles_v2_total_supply_daily',
  name: 'Total CRC Supply',
  description: 'Network-wide CRC supply (nominal and demurraged)',
  metricDescription: `Daily network-wide total CRC supply, summed across every Circles v2 token (each token's supply is the negative of its zero-address balance), in CRC. Toggle **Static** (nominal \`total_supply\`) vs **Demurraged** (\`total_demurraged_supply\`), which applies Circles' demurrage — the ~7%/year decay applied to every CRC balance — so the demurraged series reflects present-day redeemable value rather than the nominal amount ever minted. The current incomplete day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',

  // Unit toggle between static and demurraged supply
  unitFields: {
    static:     { field: 'value',            format: 'formatNumber', label: 'Static' },
    demurraged: { field: 'value_demurraged', format: 'formatNumber', label: 'Demurraged' },
  },

  query: `SELECT date, value, value_demurraged FROM dbt.api_execution_circles_v2_total_supply_daily`,
};

export default metric;
