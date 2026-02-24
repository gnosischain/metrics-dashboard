import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

const DEFAULT_EDGE_LINE_TYPES = ['solid', 'dashed', 'dotted', 'dashdot'];
const SUPPORTED_EDGE_LINE_TYPES = new Set(['solid', 'dashed', 'dotted']);
const EDGE_LEGEND_ICONS = {
  solid: 'path://M2,7 H18 V9 H2 Z',
  dashed: 'path://M2,7 H6 V9 H2 Z M8,7 H12 V9 H8 Z M14,7 H18 V9 H14 Z',
  dotted: 'path://M3,7 H5 V9 H3 Z M9,7 H11 V9 H9 Z M15,7 H17 V9 H15 Z'
};
const PAYMENT_NODE_ICON = 'path://M12 2v2.15c2.82.32 4.82 1.99 5.3 4.43h-2.52c-.4-1.28-1.5-2.01-2.98-2.01-1.86 0-3.03.82-3.03 2.05 0 1.15.95 1.74 3.78 2.49 3.17.85 5.02 2.14 5.02 4.91 0 2.6-2 4.42-5.15 4.82V22H10v-1.15c-3.12-.37-5.17-2.19-5.57-4.85h2.56c.43 1.52 1.75 2.36 3.53 2.36 1.97 0 3.22-.88 3.22-2.22 0-1.24-.9-1.88-3.83-2.67-3.28-.9-4.95-2.18-4.95-4.7 0-2.36 1.88-4.06 5.04-4.41V2H12z';
const WALLET_NODE_ICON = 'path://M3 6h14a2 2 0 0 1 2 2v1h2v7h-2v1a2 2 0 0 1-2 2H3V6zm2 2v9h12V8H5zm9 3h4v3h-4v-3z';
const encodeSvgSymbol = (svgMarkup) => `image://data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;

const buildCardNodeIcon = (isDarkMode) => {
  const backgroundColor = isDarkMode ? '#3B82F6' : '#5b5954';
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10.2" fill="${backgroundColor}"/>
      <rect x="8" y="8.4" width="8" height="6.2" rx="1.1" fill="none" stroke="#ffffff" stroke-width="1.05"/>
      <path d="M8 10h8M9.1 11.7h2M12.2 11.7h2.8M11 13.2h3.8" fill="none" stroke="#ffffff" stroke-width="0.82" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `.trim();

  return encodeSvgSymbol(svgMarkup);
};

const BUILTIN_NODE_ICON_LIBRARY = Object.freeze({
  bank: 'path://M12 2L2 7v2h20V7L12 2zm-7 9h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM2 20h20v2H2v-2z',
  payment: PAYMENT_NODE_ICON,
  wallet: WALLET_NODE_ICON
});
const DEFAULT_OUTGOING_BOUNDARY_ANCHOR_CONFIG = Object.freeze({
  enabled: false,
  sourceLabels: [],
  radiusScale: 0.72,
  laneAngleStep: 0.12,
  pinSourceNodes: true
});

const toFiniteNumber = (value) => {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const toNonNegativeNumber = (value) => {
  const numeric = toFiniteNumber(value);
  if (numeric === null) return null;
  return Math.max(0, numeric);
};

const normalizeLineType = (lineType) => {
  const normalized = typeof lineType === 'string' ? lineType.trim().toLowerCase() : '';
  if (SUPPORTED_EDGE_LINE_TYPES.has(normalized)) {
    return normalized;
  }

  if (normalized === 'dashdot' || normalized === 'dash-dot' || normalized === 'dotdash') {
    return 'dashed';
  }

  return 'solid';
};

const resolveLegendIconForLineType = (lineType) => {
  const normalized = normalizeLineType(lineType);
  return EDGE_LEGEND_ICONS[normalized] || EDGE_LEGEND_ICONS.solid;
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isRawSymbol = (value) => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim();
  return normalized.startsWith('path://') || normalized.startsWith('image://');
};

const buildNodeIconLibrary = (customLibrary, isDarkMode) => {
  const library = {
    ...BUILTIN_NODE_ICON_LIBRARY,
    card: buildCardNodeIcon(isDarkMode)
  };

  if (!isPlainObject(customLibrary)) {
    return library;
  }

  Object.entries(customLibrary).forEach(([iconKey, iconSymbol]) => {
    if (typeof iconKey !== 'string' || typeof iconSymbol !== 'string') {
      return;
    }

    const normalizedKey = iconKey.trim();
    const normalizedSymbol = iconSymbol.trim();
    if (!normalizedKey || !isRawSymbol(normalizedSymbol)) {
      return;
    }

    library[normalizedKey] = normalizedSymbol;
  });

  return library;
};

const resolveNodeSymbol = (iconReference, iconLibrary) => {
  if (typeof iconReference !== 'string') {
    return null;
  }

  const normalizedReference = iconReference.trim();
  if (!normalizedReference) {
    return null;
  }

  if (isRawSymbol(normalizedReference)) {
    return normalizedReference;
  }

  const mappedSymbol = iconLibrary[normalizedReference];
  if (typeof mappedSymbol !== 'string') {
    return null;
  }

  const normalizedMappedSymbol = mappedSymbol.trim();
  return isRawSymbol(normalizedMappedSymbol) ? normalizedMappedSymbol : null;
};

export class GraphChart extends BaseChart {
  static resolveEdgeCurvenessMap(links, baseCurveness, separation) {
    const byPair = new Map();
    const curvenessByIndex = new Map();
    const safeBase = Math.max(Math.abs(baseCurveness), 0.02);
    const safeSeparation = Math.max(separation, 0.02);

    links.forEach((link, index) => {
      const source = String(link.source);
      const target = String(link.target);
      const pairKey = source < target
        ? `${source}\u0000${target}`
        : `${target}\u0000${source}`;

      if (!byPair.has(pairKey)) {
        byPair.set(pairKey, []);
      }

      byPair.get(pairKey).push({ index, link, source, target });
    });

    byPair.forEach((pairItems) => {
      const byDirection = new Map();

      pairItems.forEach((item) => {
        const directionKey = `${item.source}\u0000${item.target}`;
        if (!byDirection.has(directionKey)) {
          byDirection.set(directionKey, []);
        }
      byDirection.get(directionKey).push(item);
      });

      const directionEntries = Array.from(byDirection.entries()).map(([directionKey, directionItems]) => {
        const orderedItems = [...directionItems].sort((a, b) => {
          const aStyle = a.link.styleValue || '';
          const bStyle = b.link.styleValue || '';
          if (aStyle !== bStyle) {
            return aStyle.localeCompare(bStyle);
          }
          return a.index - b.index;
        });
        return { directionKey, orderedItems };
      }).sort((a, b) => a.directionKey.localeCompare(b.directionKey));

      const maxDirectionCount = directionEntries.reduce((maxCount, directionEntry) => (
        Math.max(maxCount, directionEntry.orderedItems.length)
      ), 1);
      const directionSpacing = Math.max(safeSeparation * 0.9, 0.05) + Math.max(maxDirectionCount - 1, 0) * safeSeparation * 0.15;

      directionEntries.forEach((directionEntry, directionIndex) => {
        const directionBaseCurveness = Math.min(0.95, safeBase + directionIndex * directionSpacing);
        const laneMidpoint = (directionEntry.orderedItems.length - 1) / 2;
        directionEntry.orderedItems.forEach((item, position) => {
          const laneOffset = (position - laneMidpoint) * safeSeparation;
          const magnitude = Math.min(0.95, Math.max(0.02, directionBaseCurveness + laneOffset));
          curvenessByIndex.set(item.index, magnitude);
        });
      });
    });

    return curvenessByIndex;
  }

  static normalizeRows(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  }

  static normalizeOutgoingBoundaryAnchorConfig(networkConfig) {
    const rawConfig = isPlainObject(networkConfig?.outgoingBoundaryAnchors)
      ? networkConfig.outgoingBoundaryAnchors
      : {};

    const sourceLabels = Array.isArray(rawConfig.sourceLabels)
      ? rawConfig.sourceLabels.filter((value) => typeof value === 'string' && value.length > 0)
      : [];

    const radiusScale = Number.isFinite(rawConfig.radiusScale)
      ? Math.max(0.1, rawConfig.radiusScale)
      : DEFAULT_OUTGOING_BOUNDARY_ANCHOR_CONFIG.radiusScale;

    const laneAngleStep = Number.isFinite(rawConfig.laneAngleStep)
      ? Math.max(0.01, Math.abs(rawConfig.laneAngleStep))
      : DEFAULT_OUTGOING_BOUNDARY_ANCHOR_CONFIG.laneAngleStep;

    return {
      enabled: rawConfig.enabled === true,
      sourceLabels,
      sourceLabelSet: new Set(sourceLabels),
      radiusScale,
      laneAngleStep,
      pinSourceNodes: rawConfig.pinSourceNodes !== false
    };
  }

  static applyOutgoingBoundaryAnchorTransform(nodes, links, networkConfig) {
    const boundaryConfig = this.normalizeOutgoingBoundaryAnchorConfig(networkConfig);
    if (!boundaryConfig.enabled || boundaryConfig.sourceLabels.length === 0 || nodes.length === 0 || links.length === 0) {
      return { nodes, links };
    }

    const transformedNodes = nodes.map((node) => ({ ...node }));
    const transformedLinks = links.map((link) => ({ ...link }));
    const nodeById = new Map(transformedNodes.map((node) => [String(node.id), node]));
    const edgeIndexesBySourceId = new Map();

    transformedLinks.forEach((link, linkIndex) => {
      const sourceNode = nodeById.get(String(link.source));
      if (!sourceNode || !boundaryConfig.sourceLabelSet.has(sourceNode.name)) {
        return;
      }

      const sourceId = String(sourceNode.id);
      if (!edgeIndexesBySourceId.has(sourceId)) {
        edgeIndexesBySourceId.set(sourceId, []);
      }
      edgeIndexesBySourceId.get(sourceId).push(linkIndex);
    });

    if (edgeIndexesBySourceId.size === 0) {
      return { nodes, links };
    }

    let anchorCounter = 0;

    edgeIndexesBySourceId.forEach((edgeIndexes, sourceId) => {
      const sourceNode = nodeById.get(sourceId);
      if (!sourceNode) {
        return;
      }

      if (boundaryConfig.pinSourceNodes) {
        sourceNode.fixed = true;
      }

      const sourceX = Number.isFinite(sourceNode.x) ? sourceNode.x : null;
      const sourceY = Number.isFinite(sourceNode.y) ? sourceNode.y : null;
      if (sourceX === null || sourceY === null) {
        return;
      }

      const orderedEdgeIndexes = [...edgeIndexes].sort((a, b) => {
        const linkA = transformedLinks[a];
        const linkB = transformedLinks[b];
        const targetA = String(linkA.target);
        const targetB = String(linkB.target);
        if (targetA !== targetB) {
          return targetA.localeCompare(targetB);
        }

        const styleA = linkA.styleValue || '';
        const styleB = linkB.styleValue || '';
        if (styleA !== styleB) {
          return styleA.localeCompare(styleB);
        }

        return a - b;
      });

      const laneMidpoint = (orderedEdgeIndexes.length - 1) / 2;

      orderedEdgeIndexes.forEach((edgeIndex, laneIndex) => {
        const link = transformedLinks[edgeIndex];
        const targetNode = nodeById.get(String(link.target));
        if (!targetNode) {
          return;
        }

        const targetX = Number.isFinite(targetNode.x) ? targetNode.x : null;
        const targetY = Number.isFinite(targetNode.y) ? targetNode.y : null;
        if (targetX === null || targetY === null) {
          return;
        }

        const baseAngle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const laneOffset = (laneIndex - laneMidpoint) * boundaryConfig.laneAngleStep;
        const anchorAngle = baseAngle + laneOffset;
        const sourceRadius = Math.max((Number.isFinite(sourceNode.symbolSize) ? sourceNode.symbolSize : 10) / 2, 1);
        const anchorDistance = Math.max(sourceRadius * boundaryConfig.radiusScale, 1.5);
        const anchorX = sourceX + Math.cos(anchorAngle) * anchorDistance;
        const anchorY = sourceY + Math.sin(anchorAngle) * anchorDistance;
        const anchorId = `__outgoing_boundary_anchor__${sourceId}__${anchorCounter++}`;

        transformedNodes.push({
          id: anchorId,
          name: '',
          value: 0,
          inValue: 0,
          outValue: 0,
          symbol: 'circle',
          symbolSize: 0.01,
          x: anchorX,
          y: anchorY,
          fixed: true,
          silent: true,
          draggable: false,
          isBoundaryAnchor: true,
          label: { show: false },
          tooltip: { show: false },
          itemStyle: {
            color: 'rgba(0,0,0,0)',
            borderColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            opacity: 0,
            shadowBlur: 0
          },
          emphasis: {
            disabled: true
          }
        });

        transformedLinks[edgeIndex] = {
          ...link,
          source: anchorId,
          displaySource: sourceNode.name || String(sourceNode.id),
          displayTarget: targetNode.name || String(targetNode.id)
        };
      });
    });

    return {
      nodes: transformedNodes,
      links: transformedLinks
    };
  }

  static processData(data, config) {
    const rows = this.normalizeRows(data);

    if (rows.length === 0) {
      return {
        nodes: [],
        links: [],
        categories: [],
        edgeStyles: []
      };
    }

    const sourceIdField = config.sourceIdField || 'source';
    const targetIdField = config.targetIdField || 'target';
    const sourceNameField = config.sourceNameField || sourceIdField;
    const targetNameField = config.targetNameField || targetIdField;
    const sourceGroupField = config.sourceGroupField || null;
    const targetGroupField = config.targetGroupField || null;
    const valueField = config.valueField || config.yField || 'value';
    const edgeStyleField = config.edgeStyleField || null;
    const dateField = config.dateField || null;
    const amountField = config.amountField || 'amount_usd';
    const countField = config.countField || 'tf_cnt';

    const nodeMap = new Map();
    const edgeMap = new Map();
    const categories = new Set();
    const edgeStyles = new Set();
    const nodeLinkCount = new Map();

    const ensureNode = (nodeId, nodeName, categoryValue) => {
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, {
          id: nodeId,
          name: nodeName || nodeId,
          category: categoryValue ? String(categoryValue) : undefined,
          symbolSize: 10,
          value: 0,
          inValue: 0,
          outValue: 0,
          x: null,
          y: null
        });
      }

      const existingNode = nodeMap.get(nodeId);
      if (!existingNode.name && nodeName) {
        existingNode.name = nodeName;
      }
      if (categoryValue && !existingNode.category) {
        existingNode.category = String(categoryValue);
      }

      return existingNode;
    };

    rows.forEach((row) => {
      const sourceIdRaw = row?.[sourceIdField];
      const targetIdRaw = row?.[targetIdField];
      if (
        sourceIdRaw === undefined || sourceIdRaw === null || sourceIdRaw === '' ||
        targetIdRaw === undefined || targetIdRaw === null || targetIdRaw === ''
      ) {
        return;
      }

      const sourceId = String(sourceIdRaw);
      const targetId = String(targetIdRaw);
      const sourceName = row?.[sourceNameField];
      const targetName = row?.[targetNameField];
      const sourceCategory = sourceGroupField ? row?.[sourceGroupField] : null;
      const targetCategory = targetGroupField ? row?.[targetGroupField] : null;

      const sourceNode = ensureNode(sourceId, sourceName, sourceCategory);
      const targetNode = ensureNode(targetId, targetName, targetCategory);

      if (sourceCategory) categories.add(String(sourceCategory));
      if (targetCategory) categories.add(String(targetCategory));

      const value = toNonNegativeNumber(row?.[valueField]) ?? 0;
      sourceNode.value += value;
      targetNode.value += value;
      sourceNode.outValue += value;
      targetNode.inValue += value;

      nodeLinkCount.set(sourceId, (nodeLinkCount.get(sourceId) || 0) + 1);
      nodeLinkCount.set(targetId, (nodeLinkCount.get(targetId) || 0) + 1);

      const edgeStyleValue = edgeStyleField && row?.[edgeStyleField] !== undefined && row?.[edgeStyleField] !== null
        ? String(row[edgeStyleField])
        : null;

      if (edgeStyleValue) {
        edgeStyles.add(edgeStyleValue);
      }

      const edgeKey = `${sourceId}\u0000${targetId}\u0000${edgeStyleValue || '__none__'}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          source: sourceId,
          target: targetId,
          value: 0,
          styleValue: edgeStyleValue,
          date: dateField ? row?.[dateField] : null,
          tokenAddress: row?.token_address || null,
          amountUsd: 0,
          tfCnt: 0,
          hasAmountUsd: false,
          hasTfCnt: false
        });
      }

      const edge = edgeMap.get(edgeKey);
      edge.value += value;

      const amountValue = toNonNegativeNumber(row?.[amountField]);
      if (amountValue !== null) {
        edge.amountUsd += amountValue;
        edge.hasAmountUsd = true;
      }

      const countValue = toNonNegativeNumber(row?.[countField]);
      if (countValue !== null) {
        edge.tfCnt += countValue;
        edge.hasTfCnt = true;
      }

      if (!edge.date && dateField && row?.[dateField]) {
        edge.date = row[dateField];
      }
    });

    const nodes = Array.from(nodeMap.values());
    const links = Array.from(edgeMap.values()).map((edge) => ({
      ...edge,
      amountUsd: edge.hasAmountUsd ? edge.amountUsd : null,
      tfCnt: edge.hasTfCnt ? edge.tfCnt : null
    }));

    const minNodeSize = config.networkConfig?.minNodeSize || 8;
    const maxNodeSize = config.networkConfig?.maxNodeSize || 40;
    const maxNodeValue = nodes.length > 0 ? Math.max(...nodes.map((node) => node.value)) : 0;

    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    nodes.forEach((node, index) => {
      const ratio = maxNodeValue > 0 ? node.value / maxNodeValue : 0;
      node.symbolSize = minNodeSize + ratio * (maxNodeSize - minNodeSize);

      const angle = (index / Math.max(nodes.length, 1)) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);

      const linkCount = nodeLinkCount.get(node.id) || 0;
      const centralityFactor = Math.min(linkCount / 10, 1);
      node.x = node.x * (1 - centralityFactor * 0.5) + centerX * centralityFactor * 0.5;
      node.y = node.y * (1 - centralityFactor * 0.5) + centerY * centralityFactor * 0.5;
    });

    return {
      nodes,
      links,
      categories: Array.from(categories).map((name) => ({ name })),
      edgeStyles: Array.from(edgeStyles)
    };
  }

  static getOptions(data, config, isDarkMode) {
    const rows = this.normalizeRows(data);

    if (rows.length === 0) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(rows, config);
    let { nodes, links } = processedData;
    const { categories, edgeStyles } = processedData;
    if (nodes.length === 0 || links.length === 0) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const networkConfig = config.networkConfig || {};
    ({ nodes, links } = this.applyOutgoingBoundaryAnchorTransform(nodes, links, networkConfig));
    const hasBoundaryAnchorNodes = nodes.some((node) => node.isBoundaryAnchor === true);
    const requestedForceInitLayout = typeof networkConfig.forceInitLayout === 'string'
      ? networkConfig.forceInitLayout.trim().toLowerCase()
      : '';
    const forceInitLayout = requestedForceInitLayout === 'none' || requestedForceInitLayout === 'circular'
      ? requestedForceInitLayout
      : (hasBoundaryAnchorNodes ? 'none' : 'circular');
    const selectedMetricField = config.valueField || config.yField || 'value';
    const amountField = config.amountField || 'amount_usd';
    const countField = config.countField || 'tf_cnt';
    const showSelectedValueInTooltip = selectedMetricField !== amountField && selectedMetricField !== countField;
    const linkCurveness = Number.isFinite(networkConfig.linkCurveness)
      ? networkConfig.linkCurveness
      : 0.2;
    const parallelEdgeSeparation = Number.isFinite(networkConfig.parallelEdgeSeparation)
      ? networkConfig.parallelEdgeSeparation
      : 0.08;
    const linkThicknessScale = Number.isFinite(networkConfig.linkThicknessScale)
      ? networkConfig.linkThicknessScale
      : 1;
    const minThickness = Number.isFinite(networkConfig.minLinkThickness)
      ? networkConfig.minLinkThickness
      : 0.5;
    const maxThickness = Number.isFinite(networkConfig.maxLinkThickness)
      ? networkConfig.maxLinkThickness
      : 6;
    const normalizeEdgeWidthToMax = networkConfig.normalizeEdgeWidthToMax !== false;
    const nodeIconsByLabel = isPlainObject(networkConfig.nodeIconsByLabel)
      ? networkConfig.nodeIconsByLabel
      : {};
    const nodeIconLibrary = buildNodeIconLibrary(networkConfig.nodeIconLibrary, isDarkMode);

    nodes.forEach((node) => {
      if (node.isBoundaryAnchor || !Object.prototype.hasOwnProperty.call(nodeIconsByLabel, node.name)) {
        return;
      }

      const resolvedNodeSymbol = resolveNodeSymbol(nodeIconsByLabel[node.name], nodeIconLibrary);
      if (!resolvedNodeSymbol) {
        return;
      }

      node.symbol = resolvedNodeSymbol;
      node.symbolKeepAspect = true;
    });

    const categoryPalette = this.resolveSeriesPalette(config, Math.max(categories.length, 1), isDarkMode);
    const mappedCategories = categories.map((category, index) => ({
      ...category,
      itemStyle: {
        color: categoryPalette[index % categoryPalette.length]
      }
    }));

    const edgeStylePalette = this.resolveSeriesPalette(config, Math.max(edgeStyles.length, 1), isDarkMode);
    const edgeLineTypes = Array.isArray(networkConfig.edgeLineTypes) && networkConfig.edgeLineTypes.length > 0
      ? networkConfig.edgeLineTypes
      : DEFAULT_EDGE_LINE_TYPES;

    const edgeStyleVisuals = edgeStyles.reduce((acc, styleValue, index) => {
      acc[styleValue] = {
        color: edgeStylePalette[index % edgeStylePalette.length],
        type: normalizeLineType(edgeLineTypes[index % edgeLineTypes.length])
      };
      return acc;
    }, {});

    const edgeLegendItems = edgeStyles.map((styleValue) => {
      const visual = edgeStyleVisuals[styleValue];
      return {
        name: styleValue,
        color: visual?.color,
        type: visual?.type,
        icon: resolveLegendIconForLineType(visual?.type)
      };
    });

    const hasEdgeStyleLegend = edgeLegendItems.length > 0;
    const textColor = isDarkMode ? '#CBD5E1' : '#334155';
    const defaultLegendBackground = isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const defaultLegendBorderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const defaultLegendBorderWidth = 1;
    const legendData = hasEdgeStyleLegend
      ? edgeLegendItems.map((item) => ({
          name: item.name,
          icon: item.icon
        }))
      : categories.map((category) => category.name);
    const legendSelected = hasEdgeStyleLegend
      ? edgeLegendItems.reduce((acc, item) => {
          acc[item.name] = true;
          return acc;
        }, {})
      : {};

    const legendOptions = {
      data: legendData,
      selected: legendSelected,
      show: hasEdgeStyleLegend ? edgeLegendItems.length > 0 : categories.length > 1,
      type: networkConfig.legendType || (hasEdgeStyleLegend ? 'plain' : 'scroll'),
      orient: networkConfig.legendOrient || (hasEdgeStyleLegend ? 'vertical' : 'horizontal'),
      left: networkConfig.legendLeft ?? (hasEdgeStyleLegend ? 12 : 'center'),
      ...(hasEdgeStyleLegend
        ? { top: networkConfig.legendTop ?? 12 }
        : { bottom: networkConfig.legendBottom ?? 60 }),
      selectedMode: 'multiple',
      itemWidth: networkConfig.legendItemWidth ?? 18,
      itemHeight: networkConfig.legendItemHeight ?? 10,
      itemGap: networkConfig.legendItemGap ?? 8,
      ...(networkConfig.legendWidth !== null && networkConfig.legendWidth !== undefined ? { width: networkConfig.legendWidth } : {}),
      ...(networkConfig.legendHeight !== null && networkConfig.legendHeight !== undefined ? { height: networkConfig.legendHeight } : {}),
      ...(hasEdgeStyleLegend ? { align: networkConfig.legendAlign || 'left' } : {}),
      textStyle: {
        color: textColor,
        ...(networkConfig.legendFontSize !== undefined ? { fontSize: networkConfig.legendFontSize } : {})
      },
      backgroundColor: networkConfig.legendBackgroundColor ?? defaultLegendBackground,
      borderColor: networkConfig.legendBorderColor ?? defaultLegendBorderColor,
      borderWidth: networkConfig.legendBorderWidth ?? defaultLegendBorderWidth,
      padding: networkConfig.legendPadding ?? 10,
      borderRadius: networkConfig.legendBorderRadius ?? 8,
      inactiveColor: '#94A3B8'
    };

    let dateRange = null;
    if (networkConfig.linkColorByDate && config.dateField) {
      const dates = links.map((link) => new Date(link.date).getTime()).filter((timestamp) => !Number.isNaN(timestamp));
      if (dates.length > 0) {
        dateRange = [Math.min(...dates), Math.max(...dates)];
      }
    }

    const positiveValues = links.map((link) => link.value).filter((value) => value > 0);
    const minValue = positiveValues.length > 0 ? Math.min(...positiveValues) : 0;
    const sortedValues = [...positiveValues].sort((a, b) => a - b);
    const p90Index = Math.floor(sortedValues.length * 0.9);
    const p90Value = sortedValues.length > 0 ? sortedValues[Math.min(p90Index, sortedValues.length - 1)] : 0;
    const maxValue = positiveValues.length > 0 ? Math.max(...positiveValues) : 0;
    const effectiveMax = normalizeEdgeWidthToMax && p90Value > 0 ? p90Value : maxValue;
    const curvenessByIndex = this.resolveEdgeCurvenessMap(links, linkCurveness, parallelEdgeSeparation);

    const resolveEdgeThickness = (value) => {
      if (!Number.isFinite(value) || value <= 0) {
        return minThickness;
      }

      if (normalizeEdgeWidthToMax) {
        if (effectiveMax <= 0) {
          return minThickness;
        }
        const clamped = Math.min(value / effectiveMax, 1);
        const ratio = Math.sqrt(clamped);
        return minThickness + ratio * (maxThickness - minThickness);
      }

      if (maxValue > minValue) {
        const normalized = (value - minValue) / (maxValue - minValue);
        const ratio = Math.sqrt(normalized);
        return minThickness + ratio * (maxThickness - minThickness);
      }

      return minThickness;
    };

    const tooltipMutedColor = isDarkMode ? '#94A3B8' : '#64748B';
    const mainSeriesId = 'graph-main-series';
    const edgeLegendProxySeries = hasEdgeStyleLegend
      ? [{
          id: 'edge-style-legend-proxy',
          name: 'Edge styles',
          type: 'pie',
          center: [-100, -100],
          radius: 0,
          z: -10,
          silent: true,
          tooltip: { show: false },
          label: { show: false },
          labelLine: { show: false },
          data: edgeLegendItems.map((item) => ({
            name: item.name,
            value: 1,
            itemStyle: {
              color: item.color
            }
          }))
        }]
      : [];

    return {
      ...this.getBaseOptions(isDarkMode),
      color: categoryPalette,
      ...(hasEdgeStyleLegend
        ? {
            __graphEdgeLegend: {
              enabled: true,
              targetSeriesId: mainSeriesId,
              styleNames: edgeLegendItems.map((item) => item.name)
            }
          }
        : {}),
      tooltip: {
        show: true,
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        extraCssText: isDarkMode
          ? 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);'
          : 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
        padding: 10,
        textStyle: {
          color: isDarkMode ? '#E2E8F0' : '#0F172A',
          fontSize: 12
        },
        formatter: (params) => {
          if (params.dataType === 'node') {
            const node = params.data;
            if (node.isBoundaryAnchor) {
              return '';
            }
            const inflow = node.inValue || 0;
            const outflow = node.outValue || 0;
            const net = inflow - outflow;
            const nodeLines = [
              `<strong style="font-size: 14px;">${node.name}</strong>`
            ];

            if (node.category) {
              nodeLines.push(`<span style="color: ${tooltipMutedColor};">Category:</span> ${node.category}`);
            }

            nodeLines.push(`<span style="color: ${tooltipMutedColor};">Inflow:</span> ${formatValue(inflow, config.format)}`);
            nodeLines.push(`<span style="color: ${tooltipMutedColor};">Outflow:</span> ${formatValue(outflow, config.format)}`);
            nodeLines.push(`<span style="color: ${tooltipMutedColor};">Net (Inflow - Outflow):</span> ${formatValue(net, config.format)}`);
            return `<div>${nodeLines.join('<br/>')}</div>`;
          }

          if (params.dataType === 'edge') {
            const edge = params.data;
            const sourceLabel = edge.displaySource || edge.source;
            const targetLabel = edge.displayTarget || edge.target;
            const lines = [
              `<strong style="font-size: 14px;">${sourceLabel} → ${targetLabel}</strong>`
            ];

            if (showSelectedValueInTooltip) {
              lines.push(`<span style="color: ${tooltipMutedColor};">Selected Value:</span> ${formatValue(edge.value || 0, config.format)}`);
            }

            if (edge.styleValue) {
              lines.push(`<span style="color: ${tooltipMutedColor};">Symbol:</span> ${edge.styleValue}`);
            }

            if (edge.amountUsd !== null) {
              lines.push(`<span style="color: ${tooltipMutedColor};">Amount (USD):</span> ${formatValue(edge.amountUsd, 'formatCurrency')}`);
            }

            if (edge.tfCnt !== null) {
              lines.push(`<span style="color: ${tooltipMutedColor};">Transfer Count:</span> ${formatValue(edge.tfCnt, 'formatNumber')}`);
            }

            if (edge.tokenAddress) {
              lines.push(`<span style="color: ${tooltipMutedColor};">Token:</span> ${edge.tokenAddress}`);
            }

            if (edge.date) {
              lines.push(`<span style="color: ${tooltipMutedColor};">Date:</span> ${new Date(edge.date).toLocaleDateString()}`);
            }

            return `<div>${lines.join('<br/>')}</div>`;
          }

          return '';
        }
      },
      legend: legendOptions,
      series: [{
        id: mainSeriesId,
        type: 'graph',
        layout: 'force',
        animation: true,
        animationDuration: 500,
        animationEasingUpdate: 'cubicOut',
        force: {
          initLayout: forceInitLayout,
          repulsion: Number.isFinite(networkConfig.chargeStrength) ? Math.abs(networkConfig.chargeStrength) : 300,
          gravity: Number.isFinite(networkConfig.centerStrength) ? networkConfig.centerStrength : 0.1,
          edgeLength: Number.isFinite(networkConfig.linkDistance) ? networkConfig.linkDistance : 100,
          layoutAnimation: true,
          friction: 0.3
        },
        edgeSymbol: networkConfig.showArrows === false ? ['none', 'none'] : ['none', 'arrow'],
        edgeSymbolSize: Array.isArray(networkConfig.edgeSymbolSize) && networkConfig.edgeSymbolSize.length === 2
          ? networkConfig.edgeSymbolSize
          : [0, 8],
        draggable: networkConfig.enableDrag !== false,
        roam: networkConfig.enableZoom !== false,
        scaleLimit: {
          min: 0.5,
          max: 5
        },
        data: nodes,
        edges: links.map((link, linkIndex) => {
          const styleVisual = link.styleValue ? edgeStyleVisuals[link.styleValue] : null;
          let lineColor = styleVisual?.color || (isDarkMode ? '#64748B' : '#CBD5E1');

          if (networkConfig.linkColorByDate && dateRange && link.date) {
            const dateValue = new Date(link.date).getTime();
            const denominator = dateRange[1] - dateRange[0];
            const ratio = denominator > 0 ? (dateValue - dateRange[0]) / denominator : 0;
            const clampedRatio = Math.min(Math.max(ratio, 0), 1);
            const colorRange = networkConfig.linkColorDateRange || ['#4dabf7', '#e03131'];
            lineColor = this.interpolateColor(colorRange[0], colorRange[1], clampedRatio);
          }

          const thickness = resolveEdgeThickness(link.value) * linkThicknessScale;

          return {
            source: link.source,
            target: link.target,
            value: link.value,
            displaySource: link.displaySource,
            displayTarget: link.displayTarget,
            styleValue: link.styleValue,
            amountUsd: link.amountUsd,
            tfCnt: link.tfCnt,
            date: link.date,
            tokenAddress: link.tokenAddress,
            lineStyle: {
              color: lineColor,
              type: styleVisual?.type || 'solid',
              width: thickness,
              curveness: curvenessByIndex.get(linkIndex) ?? linkCurveness,
              opacity: 0.72
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: thickness * 1.4,
                opacity: 1
              }
            }
          };
        }),
        categories: mappedCategories.length > 0 ? mappedCategories : undefined,
        label: {
          show: networkConfig.showLabels === true,
          position: 'right',
          formatter: '{b}',
          fontSize: 10
        },
        emphasis: {
          focus: networkConfig.highlightConnectedNodes !== false ? 'adjacency' : 'self'
        },
        itemStyle: {
          borderColor: isDarkMode ? '#334155' : '#FFFFFF',
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }, ...edgeLegendProxySeries]
    };
  }

  static interpolateColor(color1, color2, ratio) {
    const hex2rgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb2hex = (r, g, b) => {
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);

    if (!c1 || !c2) return color1;

    const clampedRatio = Math.min(Math.max(ratio, 0), 1);
    const r = Math.round(c1.r + (c2.r - c1.r) * clampedRatio);
    const g = Math.round(c1.g + (c2.g - c1.g) * clampedRatio);
    const b = Math.round(c1.b + (c2.b - c1.b) * clampedRatio);

    return rgb2hex(r, g, b);
  }
}

export default GraphChart;
