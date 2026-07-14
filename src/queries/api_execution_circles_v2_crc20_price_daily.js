const metric = {
  id: 'api_execution_circles_v2_crc20_price_daily',
  name: 'CRC20 DEX Market (daily)',
  description: 'Daily CRC20 trading volume, swaps and USD price',
  metricDescription: `Daily DEX market activity for **CRC20 wrapper tokens**, consolidated across every pool and every CRC20 token that traded. Circles personal/group tokens each wrap to their own ERC-20 (\`crc20_token\`) and trade against backing assets. The default view is **Volume (CRC)** — total CRC20 tokens traded per day — the clearest read on market activity. Toggle **Trades** (swap transactions), **Tokens traded** (distinct CRC20 tokens with at least one trade), or **Price (USD)**. The price series is a cross-token, cross-pool **volume-weighted average** (\`sum(price_vwap_usd × total_crc_volume) / sum(total_crc_volume)\`), i.e. "what a traded CRC was worth in USD" — not the price of any single token; because different personal/group tokens genuinely trade at very different prices it is inherently choppy, so read it as an order-of-magnitude index (~\$0.01), not a precise quote. Token-days with **under 100 CRC of volume are excluded** as dust; the current incomplete day is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'volume_crc',
  format: 'formatNumberCompact',
  valueModeOptions: [
    { key: 'volume_crc',    label: 'Volume (CRC)',  valueField: 'volume_crc',    format: 'formatNumberCompact' },
    { key: 'trades',        label: 'Trades',        valueField: 'trades',        format: 'formatNumber' },
    { key: 'tokens_traded', label: 'Tokens traded', valueField: 'tokens_traded', format: 'formatNumber' },
    { key: 'price_usd',     label: 'Price (USD)',   valueField: 'price_usd',     format: 'formatCurrency' },
  ],
  defaultValueMode: 'volume_crc',
  query: `
    SELECT date,
           round(sum(price_vwap_usd * total_crc_volume) / nullIf(sum(total_crc_volume), 0), 6) AS price_usd,
           round(sum(total_crc_volume), 2) AS volume_crc,
           sum(trade_count)                AS trades,
           uniqExact(crc20_token)          AS tokens_traded
    FROM dbt.api_execution_circles_v2_crc20_prices_daily
    WHERE date < today()
      AND total_crc_volume >= 100  -- drop dust token-days that would skew the cross-token index
    GROUP BY date
    ORDER BY date
  `,
};
export default metric;
