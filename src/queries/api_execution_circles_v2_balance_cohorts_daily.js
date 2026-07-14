const metric = {
  id: 'api_execution_circles_v2_balance_cohorts_daily',
  name: 'Holder Wealth Distribution',
  description: 'CRC holders split into balance tiers over time',
  metricDescription: `Daily **wealth distribution** of Circles: every address holding a positive CRC balance is bucketed by the size of that balance (\`0-1\`, \`1-10\`, \`10-100\`, \`100-1k\`, \`1k-10k\`, \`10k-100k\`, \`100k+\` CRC) and the buckets are stacked over time. **Holders** counts distinct addresses in each tier (a wallet sits in exactly one bucket per day, by its total balance); **Total CRC** switches the same stack to the sum of nominal balances held in each tier, showing where the supply concentrates. Balances are nominal (not demurrage-adjusted) and cover all CRC token types held by an address. Because most demurraged holders cluster in the small tiers while a handful of addresses hold the bulk of CRC, the two views tell different stories — count vs. concentration. The current incomplete day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  labelField: 'label',
  tooltipOrder: 'valueDesc',
  legend: { top: 'top', type: 'scroll' },
  unitFields: {
    holders: { field: 'value',         format: 'formatNumber',        label: 'Holders' },
    balance: { field: 'value_balance', format: 'formatNumberCompact', label: 'Total CRC' },
  },
  query: `
    SELECT date,
           balance_bucket     AS label,
           holder_count       AS value,
           round(total_balance, 2) AS value_balance
    FROM dbt.api_execution_circles_v2_balance_cohorts_daily
    ORDER BY date,
             multiIf(balance_bucket = '0-1',      1,
                     balance_bucket = '1-10',     2,
                     balance_bucket = '10-100',   3,
                     balance_bucket = '100-1k',   4,
                     balance_bucket = '1k-10k',   5,
                     balance_bucket = '10k-100k', 6,
                     balance_bucket = '100k+',    7, 8)
  `,
};
export default metric;
