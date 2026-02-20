/**
 * Enhanced Sankey Chart implementation for ECharts
 * Supports cycle detection, multi-level layouts, and node alignment
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class SankeyChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    try {
      const processedData = this.processData(data, config);
      
      // --- Compute a total for this Sankey (matches current filter) ---
      let totalValue = 0;

      const metricId = String(config?.id || '').toLowerCase();
      const isOut = metricId.includes('_out_') || metricId.endsWith('_out') || metricId.includes('gnosis_out');
      const isIn  = metricId.includes('_in_')  || metricId.endsWith('_in')  || metricId.includes('gnosis_in');

      if (Array.isArray(processedData?.links)) {
        if (isOut) {
          totalValue = processedData.links
            .filter(l => String(l.source).toLowerCase() === 'gnosis')
            .reduce((s, l) => s + Number(l.value || 0), 0);
        } else if (isIn) {
          totalValue = processedData.links
            .filter(l => String(l.target).toLowerCase() === 'gnosis')
            .reduce((s, l) => s + Number(l.value || 0), 0);
        } else {
          // Fallback: sum everything (you can refine if you add other sankey types)
          totalValue = processedData.links.reduce((s, l) => s + Number(l.value || 0), 0);
        }
      }

      // Detect and handle cycles
      const cycleInfo = this.detectCycles(processedData.nodes, processedData.links);
      if (cycleInfo.hasCycle && !config.allowCycles) {
        console.warn('SankeyChart: Cycle detected in data:', cycleInfo);
        // Option 1: Remove cycle-causing links
        if (config.removeCycles) {
          processedData.links = this.removeCyclicLinks(processedData.links, cycleInfo.cyclicLinks);
        } else {
          // Option 2: Return error visualization
          return this.getCycleErrorChart(cycleInfo, isDarkMode);
        }
      }

      const colors = generateColorPalette(processedData.nodes.length, isDarkMode);

      // Merge sankeyConfig if provided (handles both locations)
      const sankeyConfig = config.sankeyConfig || config.config?.sankeyConfig || {};
      const showNodeTotals = sankeyConfig.showNodeTotals === true;
      
      // Support format at multiple levels
      const format = config.format || config.config?.format;

      const nodeLabelFormatter = showNodeTotals
        ? (params) => {
            const nodeData = params?.data || {};
            const incoming = Number(nodeData.totalIncoming || 0);
            const outgoing = Number(nodeData.totalOutgoing || 0);
            const name = params?.name || nodeData.name || '';

            if (!incoming && !outgoing) {
              return name;
            }

            const inText = incoming ? `In: ${formatValue(incoming, format)}` : null;
            const outText = outgoing ? `Out: ${formatValue(outgoing, format)}` : null;
            const totals = [inText, outText].filter(Boolean).join('\n');

            return `${name}\n${totals}`;
          }
        : undefined;

      const seriesTop = sankeyConfig.top ?? config.top;
      const rawSeriesBottom = sankeyConfig.bottom ?? config.bottom;
      const orient = sankeyConfig.orient || config.orient || 'horizontal';
      const labelFontSize = config.labelFontSize || 12;

      const autoSidePadding = sankeyConfig.fitToContainer === false
        ? null
        : this.getAutoSidePadding({
            nodes: processedData.nodes,
            links: processedData.links,
            labelFontSize,
            showNodeTotals,
            format
          });

      const seriesLeft = (sankeyConfig.left ?? config.left) ?? autoSidePadding?.left;
      const seriesRight = (sankeyConfig.right ?? config.right) ?? autoSidePadding?.right;
      const seriesBottom = rawSeriesBottom !== undefined
        ? rawSeriesBottom
        : (sankeyConfig.fitToContainer === false ? undefined : seriesTop);
      const baseNodeGap = sankeyConfig.nodePadding || sankeyConfig.nodeGap || config.nodeGap || 8;
      const effectiveNodeGap = this.getAdaptiveNodeGap({
        nodes: processedData.nodes,
        links: processedData.links,
        baseNodeGap,
        orient,
        containerHeight: config.containerHeight,
        containerWidth: config.containerWidth,
        top: seriesTop,
        bottom: seriesBottom,
        left: seriesLeft,
        right: seriesRight,
        fitToContainer: sankeyConfig.fitToContainer
      });

      return {
        ...this.getBaseOptions(isDarkMode),
        
        title: (config.title !== undefined || config.showTotal !== false) ? {
        // title hidden, subtext shown at title position
        text: '',
        left: 'center',
        top: 0,
        itemGap: 0,

        // title invisible
        textStyle: { fontSize: 0 },

        // show the total as subtext
        subtext: config.showTotal === false
          ? undefined
          : `Total: ${formatValue(totalValue || 0, (config.format || config.config?.format))}`,

        subtextStyle: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',   // gray-400 / gray-500
          fontSize: 16,
          fontWeight: 400
        }
      } : undefined,

        series: [{
          type: 'sankey',
          // Layout algorithm: 'none' for manual positioning
          layout: config.layout || 'none',
          // Node alignment: 'justify', 'left', 'right'
          nodeAlign: config.nodeAlign || 'justify',
          // Orient: 'horizontal' or 'vertical'
          orient,
          // Node width - support both config.nodeWidth and sankeyConfig.nodeWidth
          nodeWidth: sankeyConfig.nodeWidth || config.nodeWidth || 20,
          // Gap between nodes - support nodePadding from sankeyConfig
          nodeGap: effectiveNodeGap,
          // Layout iterations for optimization
          layoutIterations: config.layoutIterations || 32,
          top: seriesTop,
          bottom: seriesBottom,
          left: seriesLeft,
          right: seriesRight,
          
          emphasis: {
            focus: 'adjacency',
            blurScope: 'coordinateSystem',
            itemStyle: {
              borderColor: isDarkMode ? '#0F172A' : '#334155',
              borderWidth: 2
            }
          },
          
          data: processedData.nodes.map((node, index) => ({
            ...node,
            itemStyle: {
              color: node.color || colors[index % colors.length],
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
              borderWidth: 1
            },
            label: {
              show: true,
              position: config.labelPosition || 'right',
              color: isDarkMode ? '#e5e7eb' : '#374151',
              fontSize: config.labelFontSize || 12,
              formatter: nodeLabelFormatter
            }
          })),
          
          links: processedData.links.map(link => {
            // Ensure source and target names are preserved in the link data
            const processedLink = {
              source: link.source,
              target: link.target,
              value: link.value,
              // Store the names in the link data for tooltip access
              sourceName: link.source,
              targetName: link.target,
              lineStyle: {
                opacity: link.opacity || 0.3,
                curveness: link.curveness || 0.5,
                color: link.color || 'source'
              },
              emphasis: {
                lineStyle: {
                  opacity: 0.6
                }
              }
            };
            return processedLink;
          }),
          
          lineStyle: {
            curveness: config.curveness || 0.5
          }
        }],
        
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          borderColor: isDarkMode ? '#334155' : '#E2E8F0',
          borderWidth: 1,
          borderRadius: 8,
          extraCssText: isDarkMode
            ? 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);'
            : 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
          textStyle: {
            color: isDarkMode ? '#E2E8F0' : '#0F172A'
          },
          formatter: function(params) {
            if (params.dataType === 'node') {
              const formattedValue = formatValue(params.value || 0, format);
              const nodeData = params.data;
              let tooltip = `<strong>${params.name}</strong>`;
              if (nodeData.totalIncoming !== undefined || nodeData.totalOutgoing !== undefined) {
                tooltip += `<br/>Incoming: ${formatValue(nodeData.totalIncoming || 0, format)}`;
                tooltip += `<br/>Outgoing: ${formatValue(nodeData.totalOutgoing || 0, format)}`;
              } else if (params.value !== undefined) {
                tooltip += `<br/>Value: ${formattedValue}`;
              }
              return tooltip;
            } else if (params.dataType === 'edge') {
              const formattedValue = formatValue(params.value || 0, format);
              
              // ECharts provides source/target names in params.name as "source > target"
              if (params.name && params.name.includes(' > ')) {
                const [sourceName, targetName] = params.name.split(' > ');
                return `${sourceName} → ${targetName}<br/>Flow: <strong>${formattedValue}</strong>`;
              }
              
              // Fallback
              return `Flow: <strong>${formattedValue}</strong>`;
            }
            return '';
          }
        }
      };
    } catch (error) {
      console.error('SankeyChart: Error processing data:', error);
      return this.getErrorChart(error.message, isDarkMode);
    }
  }

  static processData(data, config) {
    // Handle both old format (fields at root) and new format (fields in config)
    const sourceField = config.sourceField || config.config?.sourceField || 'source';
    const targetField = config.targetField || config.config?.targetField || 'target';
    const valueField = config.valueField || config.config?.valueField || 'value';

    if (!Array.isArray(data)) {
      throw new Error('Sankey chart data must be an array');
    }

    // Extract unique nodes and their properties
    const nodeMap = new Map();
    const links = [];

    data.forEach(item => {
      const source = item[sourceField];
      const target = item[targetField];
      const value = parseFloat(item[valueField] || 0);

      if (!source || !target) {
        console.warn('SankeyChart: Skipping item with missing source or target:', item);
        return;
      }

      // Process source node
      if (!nodeMap.has(source)) {
        nodeMap.set(source, {
          name: source,
          totalOutgoing: 0,
          totalIncoming: 0
        });
      }
      nodeMap.get(source).totalOutgoing += value;

      // Process target node
      if (!nodeMap.has(target)) {
        nodeMap.set(target, {
          name: target,
          totalOutgoing: 0,
          totalIncoming: 0
        });
      }
      nodeMap.get(target).totalIncoming += value;

      // Create link
      links.push({
        source,
        target,
        value
      });
    });

    // Convert node map to array
    const nodes = Array.from(nodeMap.values());

    // Auto-calculate levels if not provided
    if (config.autoCalculateLevels) {
      this.calculateNodeLevels(nodes, links);
    }

    return { nodes, links };
  }

  static calculateNodeLevels(nodes, links) {
    // Create adjacency lists
    const graph = new Map();
    const reverseGraph = new Map();
    
    nodes.forEach(node => {
      graph.set(node.name, []);
      reverseGraph.set(node.name, []);
    });
    
    links.forEach(link => {
      graph.get(link.source).push(link.target);
      reverseGraph.get(link.target).push(link.source);
    });

    // Find source nodes (no incoming edges)
    const sourceNodes = nodes.filter(node => reverseGraph.get(node.name).length === 0);
    
    // BFS to assign levels
    const visited = new Set();
    const queue = sourceNodes.map(node => ({ name: node.name, level: 0 }));
    
    while (queue.length > 0) {
      const { name, level } = queue.shift();
      
      if (visited.has(name)) continue;
      visited.add(name);
      
      const node = nodes.find(n => n.name === name);
      if (node) {
        node.level = level;
      }
      
      graph.get(name).forEach(target => {
        if (!visited.has(target)) {
          queue.push({ name: target, level: level + 1 });
        }
      });
    }

    // Handle disconnected nodes
    nodes.forEach(node => {
      if (node.level === undefined) {
        node.level = 0;
      }
    });
  }

  static resolvePaddingValue(value, containerSize) {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'string') return 0;

    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (trimmed.endsWith('%')) {
      const percent = parseFloat(trimmed.slice(0, -1));
      if (Number.isFinite(percent) && Number.isFinite(containerSize)) {
        return (percent / 100) * containerSize;
      }
      return 0;
    }

    const numeric = trimmed.endsWith('px') ? trimmed.slice(0, -2) : trimmed;
    const parsed = parseFloat(numeric);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  static estimateLabelWidth(text, fontSize) {
    const safeText = text === undefined || text === null ? '' : String(text);
    const size = Number.isFinite(fontSize) ? fontSize : 12;
    return Math.ceil(safeText.length * size * 0.6);
  }

  static getNodeLabelLines(node, showNodeTotals, format) {
    const name = node?.name ?? '';
    const lines = [name];

    if (showNodeTotals) {
      const incoming = Number(node?.totalIncoming || 0);
      const outgoing = Number(node?.totalOutgoing || 0);
      if (incoming) lines.push(`In: ${formatValue(incoming, format)}`);
      if (outgoing) lines.push(`Out: ${formatValue(outgoing, format)}`);
    }

    return lines;
  }

  static computeLevelsMap(nodes, links) {
    const graph = new Map();
    const reverseGraph = new Map();

    nodes.forEach(node => {
      graph.set(node.name, []);
      reverseGraph.set(node.name, []);
    });

    links.forEach(link => {
      if (!graph.has(link.source) || !reverseGraph.has(link.target)) return;
      graph.get(link.source).push(link.target);
      reverseGraph.get(link.target).push(link.source);
    });

    const sourceNodes = nodes.filter(node => (reverseGraph.get(node.name) || []).length === 0);
    const levels = new Map();
    const visited = new Set();
    const queue = sourceNodes.map(node => ({ name: node.name, level: 0 }));

    while (queue.length > 0) {
      const { name, level } = queue.shift();
      if (visited.has(name)) continue;
      visited.add(name);
      levels.set(name, level);

      const neighbors = graph.get(name) || [];
      neighbors.forEach(target => {
        if (!visited.has(target)) {
          queue.push({ name: target, level: level + 1 });
        }
      });
    }

    nodes.forEach(node => {
      if (!levels.has(node.name)) {
        levels.set(node.name, 0);
      }
    });

    return levels;
  }

  static getMaxNodesPerLevel(nodes, links) {
    if (!Array.isArray(nodes) || nodes.length === 0) return 1;

    const hasLevels = nodes.some(node => typeof node.level === 'number');
    const levelsMap = hasLevels ? null : this.computeLevelsMap(nodes, links);
    const counts = new Map();

    nodes.forEach(node => {
      const level = typeof node.level === 'number'
        ? node.level
        : (levelsMap?.get(node.name) ?? 0);
      counts.set(level, (counts.get(level) || 0) + 1);
    });

    let max = 1;
    counts.forEach(value => {
      if (value > max) max = value;
    });
    return max;
  }

  static getAdaptiveNodeGap({
    nodes,
    links,
    baseNodeGap,
    orient,
    containerHeight,
    containerWidth,
    top,
    bottom,
    left,
    right,
    fitToContainer
  }) {
    if (fitToContainer === false) return baseNodeGap;

    const containerSize = orient === 'vertical' ? containerWidth : containerHeight;
    if (!Number.isFinite(containerSize) || containerSize <= 0) return baseNodeGap;

    const paddingStart = this.resolvePaddingValue(orient === 'vertical' ? left : top, containerSize);
    const paddingEnd = this.resolvePaddingValue(orient === 'vertical' ? right : bottom, containerSize);
    const availableSize = containerSize - paddingStart - paddingEnd;

    if (!Number.isFinite(availableSize) || availableSize <= 0) return baseNodeGap;

    const maxNodes = this.getMaxNodesPerLevel(nodes, links);
    const gapBudget = availableSize * 0.25;
    const maxGap = Math.floor(gapBudget / Math.max(1, maxNodes - 1));
    const minGap = 2;

    if (!Number.isFinite(maxGap) || maxGap <= 0) {
      return Math.max(minGap, baseNodeGap);
    }

    return Math.min(baseNodeGap, Math.max(minGap, maxGap));
  }

  static getAutoSidePadding({ nodes, links, labelFontSize, showNodeTotals, format }) {
    if (!Array.isArray(nodes) || nodes.length === 0) return null;

    const levelsMap = this.computeLevelsMap(nodes, links);
    const levels = Array.from(levelsMap.values());
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);

    const leftNodes = nodes.filter(node => (levelsMap.get(node.name) ?? 0) === minLevel);
    const rightNodes = nodes.filter(node => (levelsMap.get(node.name) ?? 0) === maxLevel);

    const getMaxWidth = (subset) => {
      let maxWidth = 0;
      subset.forEach(node => {
        const lines = this.getNodeLabelLines(node, showNodeTotals, format);
        const maxLine = lines.reduce((acc, line) => {
          const width = this.estimateLabelWidth(line, labelFontSize);
          return Math.max(acc, width);
        }, 0);
        if (maxLine > maxWidth) maxWidth = maxLine;
      });
      return maxWidth;
    };

    const leftWidth = getMaxWidth(leftNodes);
    const rightWidth = getMaxWidth(rightNodes);

    const basePadding = Math.max(8, Math.round((Number.isFinite(labelFontSize) ? labelFontSize : 12) * 0.6));
    const minPadding = 12;
    const maxPadding = 140;

    const clampPadding = (value) =>
      Math.min(maxPadding, Math.max(minPadding, value + basePadding));

    return {
      left: clampPadding(leftWidth),
      right: clampPadding(rightWidth)
    };
  }

  static detectCycles(nodes, links) {
    const graph = new Map();
    nodes.forEach(node => graph.set(node.name, []));
    links.forEach(link => {
      graph.get(link.source).push({ target: link.target, link });
    });

    const visited = new Set();
    const recursionStack = new Set();
    const cyclicLinks = [];
    let hasCycle = false;

    const dfs = (node, path = []) => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const { target, link } of neighbors) {
        if (!visited.has(target)) {
          if (dfs(target, [...path, link])) {
            hasCycle = true;
          }
        } else if (recursionStack.has(target)) {
          // Cycle detected
          hasCycle = true;
          cyclicLinks.push(link);
          console.warn(`SankeyChart: Cycle detected: ${node} -> ${target}`);
        }
      }

      recursionStack.delete(node);
      return hasCycle;
    };

    nodes.forEach(node => {
      if (!visited.has(node.name)) {
        dfs(node.name);
      }
    });

    return { hasCycle, cyclicLinks };
  }

  static removeCyclicLinks(links, cyclicLinks) {
    const cyclicSet = new Set(cyclicLinks);
    return links.filter(link => !cyclicSet.has(link));
  }

  static getCycleErrorChart(cycleInfo, isDarkMode) {
    return {
      ...this.getBaseOptions(isDarkMode),
      title: {
        text: 'Cycle Detected in Sankey Data',
        subtext: 'The data contains circular references which are not allowed in Sankey diagrams',
        left: 'center',
        top: 'center',
        textStyle: {
          color: isDarkMode ? '#ef4444' : '#dc2626',
          fontSize: 18
        },
        subtextStyle: {
          color: isDarkMode ? '#f87171' : '#ef4444',
          fontSize: 14
        }
      }
    };
  }

  static getErrorChart(message, isDarkMode) {
    return {
      ...this.getBaseOptions(isDarkMode),
      title: {
        text: 'Error Loading Sankey Chart',
        subtext: message,
        left: 'center',
        top: 'center',
        textStyle: {
          color: isDarkMode ? '#ef4444' : '#dc2626',
          fontSize: 18
        },
        subtextStyle: {
          color: isDarkMode ? '#f87171' : '#ef4444',
          fontSize: 14
        }
      }
    };
  }
}

export default SankeyChart;
