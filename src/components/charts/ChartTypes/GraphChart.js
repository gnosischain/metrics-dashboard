import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

const DEFAULT_EDGE_LINE_TYPES = ['solid', 'dashed', 'dotted', 'dashdot'];
const SUPPORTED_EDGE_LINE_TYPES = new Set(['solid', 'dashed', 'dotted']);
const EDGE_LEGEND_ICONS = {
  solid: 'path://M2,7 H18 V9 H2 Z',
  dashed: 'path://M2,7 H6 V9 H2 Z M8,7 H12 V9 H8 Z M14,7 H18 V9 H14 Z',
  dotted: 'path://M3,7 H5 V9 H3 Z M9,7 H11 V9 H9 Z M15,7 H17 V9 H15 Z'
};

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

export class GraphChart extends BaseChart {
  static resolveEdgeCurvenessMap(links, baseCurveness, separation) {
    const byPair = new Map();
    const curvenessByIndex = new Map();
    const safeBase = Math.max(Math.abs(baseCurveness), 0.02);
    const safeSeparation = Math.max(separation, 0);

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

      byDirection.forEach((directionItems, directionKey) => {
        const [source, target] = directionKey.split('\u0000');
        const directionSign = source <= target ? 1 : -1;
        const orderedItems = [...directionItems].sort((a, b) => {
          const aStyle = a.link.styleValue || '';
          const bStyle = b.link.styleValue || '';
          if (aStyle !== bStyle) {
            return aStyle.localeCompare(bStyle);
          }
          return a.index - b.index;
        });

        const count = orderedItems.length;
        orderedItems.forEach((item, position) => {
          const centeredOffset = count === 1
            ? 0
            : (position - (count - 1) / 2) * safeSeparation;
          const magnitude = Math.max(0.02, safeBase + centeredOffset);
          curvenessByIndex.set(item.index, directionSign * magnitude);
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

    const { nodes, links, categories, edgeStyles } = this.processData(rows, config);
    if (nodes.length === 0 || links.length === 0) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const networkConfig = config.networkConfig || {};
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
    const maxValue = positiveValues.length > 0 ? Math.max(...positiveValues) : 0;
    const curvenessByIndex = this.resolveEdgeCurvenessMap(links, linkCurveness, parallelEdgeSeparation);

    const resolveEdgeThickness = (value) => {
      if (!Number.isFinite(value) || value <= 0) {
        return minThickness;
      }

      if (normalizeEdgeWidthToMax) {
        if (maxValue <= 0) {
          return minThickness;
        }
        return minThickness + (value / maxValue) * (maxThickness - minThickness);
      }

      if (maxValue > minValue) {
        return minThickness + ((value - minValue) / (maxValue - minValue)) * (maxThickness - minThickness);
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
            const lines = [
              `<strong style="font-size: 14px;">${edge.source} → ${edge.target}</strong>`
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
          initLayout: 'circular',
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
