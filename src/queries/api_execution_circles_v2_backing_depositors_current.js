const metric = {
  id: 'api_execution_circles_v2_backing_depositors_current',
  name: 'Depositors (earliest first)',
  description: 'Addresses that pledged backing collateral',
  metricDescription: `**Depositors (earliest first).** One row per address that has ever emitted a Circles Backing event (the \`backer\` decoded from the \`CirclesBackingFactory\` contract) — the *transactional* depositor set, distinct from the trust-defined **backers** (addresses on the backers group's trust list). \`n_initiated\` / \`n_completed\` / \`n_released\` are that depositor's lifetime event counts in the \`initiated\` / \`completed\` / \`released\` lifecycle stages, and \`n_distinct_assets\` is the number of distinct assets they pledged as backing collateral. \`first_initiated\` is the depositor's earliest backing event (any stage) and \`last_event\` their most recent. The 200 earliest depositors, ordered by first backing activity (oldest cohort first) — a chronological listing, not an activity ranking.`,
  chartType: 'table',
  query: `
    SELECT
      backer,
      toDate(first_initiated_at) AS first_initiated,
      toDate(last_event_at)      AS last_event,
      n_initiated,
      n_completed,
      n_released,
      n_distinct_assets
    FROM dbt.api_execution_circles_v2_backing_depositors_current
    ORDER BY first_initiated_at ASC
    LIMIT 200
  `,
};
export default metric;
