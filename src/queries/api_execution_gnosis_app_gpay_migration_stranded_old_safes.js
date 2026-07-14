import { formatCurrency, formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_execution_gnosis_app_gpay_migration_stranded_old_safes',
  name: 'Stranded funds — old Safes still holding USD',
  description: 'Migrated users who have not moved funds to their new card (outreach list)',
  metricDescription: `Outreach list: the top 50 migrated **old** Safes still holding a positive USD balance at the latest \`int_execution_gpay_balances_daily\` date — funds the user has not yet moved to their new card. \`usd_stranded\` sums all token USD balances held by the old Safe on that latest date; joined via \`int_execution_gpay_safe_canonical\` to the user's \`gp_user_id\` and new (canonical) Safe. **New card** reads \`active\` when that new Safe has any \`int_execution_gpay_activity\` since \`2026-06-04\`, else \`dormant\`. Ranked by USD stranded, top 50.`,
  chartType: 'table',
  columns: [
    { field: 'old_safe', title: 'Old Safe', formatter: (cell) => formatTruncateHex(cell.getValue()) },
    { field: 'gp_user_id', title: 'GP user' },
    { field: 'usd_stranded', title: 'USD stranded', sorter: 'number', formatter: (cell) => formatCurrency(cell.getValue()) },
    { field: 'new_safe', title: 'New Safe', formatter: (cell) => formatTruncateHex(cell.getValue()) },
    { field: 'new_safe_active', title: 'New card', formatter: (cell) => (Number(cell.getValue()) === 1 ? 'active' : 'dormant') },
  ],
  query: "SELECT o.old_safe AS old_safe, c.gp_user_id AS gp_user_id, round(o.usd_stranded, 2) AS usd_stranded, c.canonical_address AS new_safe, toInt64(if(a.new_safe != '', 1, 0)) AS new_safe_active FROM (SELECT lower(b.address) AS old_safe, sum(b.balance_usd) AS usd_stranded FROM dbt.int_execution_gpay_balances_daily b WHERE b.date = (SELECT max(date) FROM dbt.int_execution_gpay_balances_daily) AND b.balance_usd IS NOT NULL GROUP BY lower(b.address) HAVING sum(b.balance_usd) > 0) o INNER JOIN dbt.int_execution_gpay_safe_canonical c ON o.old_safe = c.address LEFT JOIN (SELECT DISTINCT lower(wallet_address) AS new_safe FROM dbt.int_execution_gpay_activity WHERE date >= toDate('2026-06-04')) a ON c.canonical_address = a.new_safe ORDER BY usd_stranded DESC LIMIT 50",
};

export default metric;
