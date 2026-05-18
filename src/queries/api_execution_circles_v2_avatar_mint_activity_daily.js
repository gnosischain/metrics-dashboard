const metric = {
  id: 'api_execution_circles_v2_avatar_mint_activity_daily',
  name: 'Mint Activity',
  description: 'Daily personal CRC minted by the avatar',
  metricDescription: 'Daily personal-mint activity for the selected Circles v2 avatar. Each Circles human can mint up to 1 CRC per hour via `personalMint()` on the Hub contract; the chart shows the actual amount that landed on-chain each UTC day, plus the number of mint transactions on the tooltip.',
  chartType: 'bar',
  globalFilterField: 'avatar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'amount_minted',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  query: `
    SELECT avatar, date, mint_events, amount_minted
    FROM dbt.api_execution_circles_v2_avatar_mint_activity_daily
    WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};

export default metric;
