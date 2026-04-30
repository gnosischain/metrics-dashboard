const metric = {
  id: 'api_execution_circles_v2_avatar_trust_network',
  name: 'Trust Network',
  description: 'Concentric view of the avatar\'s trust graph',
  metricDescription: 'Trust network for the selected Circles v2 avatar, laid out as concentric rings around the focal node:\n\n- 🟧 **Mutual** — innermost ring; both sides trust each other (rendered as two arrows in opposite directions)\n- 🟩 **Trust given** — middle ring; outgoing trust from the avatar\n- 🟦 **Trust received** — outermost ring; incoming trust into the avatar\n\nEach node carries the avatar\'s IPFS profile picture (when published) or a coloured circle as fallback. Click and drag any node to inspect; scroll to zoom.',
  chartType: 'graph',
  globalFilterField: 'avatar',
  format: 'formatNumber',

  // Edge endpoints
  sourceIdField: 'source_id',
  sourceNameField: 'source_name',
  sourceGroupField: 'source_layer',
  targetIdField: 'target_id',
  targetNameField: 'target_name',
  targetGroupField: 'target_layer',
  valueField: 'value',

  // Per-node IPFS profile thumbnails (data:image base64 or https URLs)
  sourceImageField: 'source_image',
  targetImageField: 'target_image',

  // Direction → edge color (NEW: deterministic edgeStyleColors map)
  edgeStyleField: 'direction',
  edgeStyleColors: {
    'Mutual':         '#f59e0b', // orange
    'Trust given':    '#22c55e', // green
    'Trust received': '#3b82f6', // blue
  },

  // Concentric layout: target_layer drives the ring assignment.
  // The concentricLayers array order defines the rings (centre = 0,
  // then 1 = mutual, 2 = given, 3 = received).
  concentricLayoutField: 'target_layer',

  // Pin node category colours so the rings are visually distinct.
  colors: [
    '#94a3b8', // Focal avatar (slate)
    '#f59e0b', // Mutual
    '#22c55e', // Trust given
    '#3b82f6', // Trust received
  ],

  networkConfig: {
    // Concentric layout config — consumed by the new GraphChart pass
    concentricLayers: [
      'Focal avatar',
      'Mutual',
      'Trust given',
      'Trust received',
    ],
    concentricBaseRadius: 110,
    concentricRingStep: 110,

    // Visuals
    showLabels: false,        // 270+ labels would be too noisy; tooltip shows on hover
    minNodeSize: 24,          // Larger so the avatar thumbnails are readable
    maxNodeSize: 36,
    minLinkThickness: 1,
    maxLinkThickness: 2,
    normalizeEdgeWidthToMax: true,
    showArrows: true,
    parallelEdgeSeparation: 0.18,
    linkCurveness: 0.22,

    // Interaction
    enableDrag: true,
    enableZoom: true,
    highlightConnectedNodes: true,

    // Legend (edge colours)
    legendOrient: 'horizontal',
    legendBottom: 12,
    legendLeft: 'center',
  },

  query: `
    WITH relations AS (
      SELECT
        avatar,
        direction AS relation_direction,
        counterparty
      FROM dbt.api_execution_circles_v2_avatar_trust_relations
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      LIMIT 500
    ),
    edges AS (
      SELECT
        avatar,
        avatar AS source_id,
        counterparty AS target_id,
        'Focal avatar' AS source_layer,
        if(relation_direction = 'mutual', 'Mutual', 'Trust given') AS target_layer,
        if(relation_direction = 'mutual', 'Mutual', 'Trust given') AS direction,
        toFloat64(1) AS value
      FROM relations
      WHERE relation_direction IN ('outgoing', 'mutual')

      UNION ALL

      SELECT
        avatar,
        counterparty AS source_id,
        avatar AS target_id,
        if(relation_direction = 'mutual', 'Mutual', 'Trust received') AS source_layer,
        'Focal avatar' AS target_layer,
        if(relation_direction = 'mutual', 'Mutual', 'Trust received') AS direction,
        toFloat64(1) AS value
      FROM relations
      WHERE relation_direction IN ('incoming', 'mutual')
    ),
    edge_nodes AS (
      SELECT source_id AS avatar_key FROM edges
      UNION ALL
      SELECT target_id AS avatar_key FROM edges
    ),
    metadata AS (
      SELECT
        avatar AS avatar_key,
        name,
        metadata_name,
        metadata_preview_image_url,
        metadata_image_url
      FROM dbt.api_execution_circles_v2_avatar_metadata
      WHERE avatar IN (SELECT avatar_key FROM edge_nodes)
    )
    SELECT
      edges.avatar,
      edges.source_id,
      coalesce(nullIf(source_metadata.metadata_name, ''), nullIf(source_metadata.name, ''), edges.source_id) AS source_name,
      edges.source_layer,
      coalesce(source_metadata.metadata_preview_image_url, source_metadata.metadata_image_url) AS source_image,
      edges.target_id,
      coalesce(nullIf(target_metadata.metadata_name, ''), nullIf(target_metadata.name, ''), edges.target_id) AS target_name,
      edges.target_layer,
      coalesce(target_metadata.metadata_preview_image_url, target_metadata.metadata_image_url) AS target_image,
      edges.direction,
      edges.value
    FROM edges
    LEFT JOIN metadata AS source_metadata
      ON source_metadata.avatar_key = edges.source_id
    LEFT JOIN metadata AS target_metadata
      ON target_metadata.avatar_key = edges.target_id
    ORDER BY
      multiIf(edges.direction = 'Mutual', 1, edges.direction = 'Trust given', 2, edges.direction = 'Trust received', 3, 4),
      edges.target_id,
      edges.source_id
  `,
};

export default metric;
