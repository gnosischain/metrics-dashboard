const metric = {
  id: 'api_execution_circles_v2_backing_events_daily',
  name: 'Backing Events',
  description: 'Daily backing-lifecycle events by stage',
  metricDescription: `**Daily Circles Backing lifecycle events, by stage.** Counts events emitted by the \`CirclesBackingFactory\` contract each day, split by \`lifecycle_stage\`: \`initiated\` (\`CirclesBackingInitiated\`), \`deployed\` (\`CirclesBackingDeployed\`), \`lbp_deployed\` (\`LBPDeployed\`), \`completed\` (\`CirclesBackingCompleted\`), \`released\` (\`Released\`), \`asset_status_updated\` (\`AssetSupportedStatusUpdated\`) and \`global_release_updated\` (\`GlobalReleaseUpdated\`). \`n_events\` is the raw event count in that stage that day (one address can appear across several stages), and the current incomplete day is excluded. This tracks daily backing-lifecycle events, **including contract-admin stages** (\`asset_status_updated\` and \`global_release_updated\` are emitted with no backer); it is **not a depositor count** — distinct from the trust-defined **backers** set (addresses trusted by the backers group).`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_events',
  seriesField: 'lifecycle_stage',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT
      date,
      multiIf(
        lifecycle_stage = 'initiated', 'Initiated',
        lifecycle_stage = 'deployed', 'Deployed',
        lifecycle_stage = 'lbp_deployed', 'LBP Deployed',
        lifecycle_stage = 'completed', 'Completed',
        lifecycle_stage = 'released', 'Released',
        lifecycle_stage = 'asset_status_updated', 'Asset Status Updated',
        lifecycle_stage = 'global_release_updated', 'Global Release Updated',
        lifecycle_stage
      ) AS lifecycle_stage,
      n_events
    FROM dbt.api_execution_circles_v2_backing_events_daily
    ORDER BY date
  `,
};
export default metric;
