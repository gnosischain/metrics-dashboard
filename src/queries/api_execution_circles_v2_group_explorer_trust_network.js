const metric = {
  id: 'api_execution_circles_v2_group_explorer_trust_network',
  name: 'Membership Network',
  description: 'The group at the centre, members on the surrounding rings',
  metricDescription: `Current trust graph around the group: the group node in the centre, its members on the surrounding rings. A **member** is an address on the group's outgoing trust list — an address the group currently trusts, taken from the live trust snapshot (active edges only).\n\n- **Mutual** (inner ring, orange) — the member also trusts the group back\n- **Member / trust given** (outer ring, green) — the group trusts the member, but not vice versa\n\nCapped at the 300 members with the most recent trust (mutual first) for readability. Drag any node to inspect; scroll to zoom.`,
  chartType: 'graph',
  globalFilterField: 'group_address',
  format: 'formatNumber',

  sourceIdField: 'source_id',
  sourceNameField: 'source_name',
  sourceGroupField: 'source_layer',
  targetIdField: 'target_id',
  targetNameField: 'target_name',
  targetGroupField: 'target_layer',
  valueField: 'value',

  sourceImageField: 'source_image',
  targetImageField: 'target_image',

  edgeStyleField: 'direction',
  edgeStyleColors: {
    'Mutual':      '#f59e0b',
    'Trust given': '#22c55e',
  },

  concentricLayoutField: 'target_layer',
  colors: [
    '#94a3b8', // Focal group (slate)
    '#f59e0b', // Mutual
    '#22c55e', // Member
  ],

  networkConfig: {
    concentricLayers: ['Focal group', 'Mutual', 'Member'],
    concentricBaseRadius: 110,
    concentricRingStep: 120,
    showLabels: false,
    minNodeSize: 22,
    maxNodeSize: 34,
    minLinkThickness: 1,
    maxLinkThickness: 2,
    normalizeEdgeWidthToMax: true,
    showArrows: true,
    parallelEdgeSeparation: 0.18,
    linkCurveness: 0.2,
    enableDrag: true,
    enableZoom: true,
    highlightConnectedNodes: true,
    legendOrient: 'horizontal',
    legendBottom: 12,
    legendLeft: 'center',
  },

  query: `
    WITH members AS (
      SELECT group_address, member, display_name, preview_image_url, is_mutual, member_since
      FROM dbt.api_execution_circles_v2_group_members
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      ORDER BY is_mutual DESC, member_since DESC
      LIMIT 300
    ),
    grp AS (
      SELECT group_address, display_name, preview_image_url
      FROM dbt.api_execution_circles_v2_group_explorer_profile
      WHERE group_address IN (SELECT DISTINCT group_address FROM members)
    )
    SELECT
      m.group_address AS avatar,
      m.group_address AS source_id,
      coalesce(nullIf(g.display_name, ''), m.group_address) AS source_name,
      'Focal group' AS source_layer,
      g.preview_image_url AS source_image,
      m.member AS target_id,
      coalesce(nullIf(m.display_name, ''), m.member) AS target_name,
      if(m.is_mutual, 'Mutual', 'Member') AS target_layer,
      m.preview_image_url AS target_image,
      if(m.is_mutual, 'Mutual', 'Trust given') AS direction,
      toFloat64(1) AS value
    FROM members m
    INNER JOIN grp g ON g.group_address = m.group_address
    ORDER BY m.is_mutual DESC, m.member
  `,
};

export default metric;
