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
    SELECT
      avatar,
      source_id,
      source_name,
      source_layer,
      source_image,
      target_id,
      target_name,
      target_layer,
      target_image,
      direction,
      value
    FROM dbt.api_execution_circles_v2_avatar_trust_network
  `,
};

export default metric;
