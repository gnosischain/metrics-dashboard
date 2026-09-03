const metric = {
  id: 'overview_gno_circulating_supply_daily',
  name: 'GNO Circulating Supply',
  metricDescription: 'Total circulating GNO: mainnet circulating supply plus the Gnosis-chain totalSupply that the Omnibridge escrow backs. Derived on-chain from rpc-state-indexer state — minted totalSupply less burned (balanceOf 0x0), vesting wallets and the bridge escrow, plus Gnosis-chain supply. Counting Gnosis-chain supply rather than the mainnet escrow avoids double-counting the bridged portion. History from 2020-11-01, the chain-1 day-anchor start.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100
  },
  format: 'formatNumber',

  symbolSize: 2,
  lineWidth: 2,

  xField: 'date',
  yField: 'supply',

  query: `SELECT date, supply FROM dbt.api_gno_supply_daily
WHERE label = 'Total Circ. Supply'
ORDER BY date`,
};

export default metric;
