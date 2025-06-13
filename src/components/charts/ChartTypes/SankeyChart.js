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
      
      // Support format at multiple levels
      const format = config.format || config.config?.format;

      return {
        ...this.getBaseOptions(isDarkMode),
        
        title: config.title ? {
          text: config.title,
          left: 'center',
          textStyle: {
            color: isDarkMode ? '#e5e7eb' : '#111827',
            fontSize: 16
          }
        } : undefined,
        
        series: [{
          type: 'sankey',
          // Layout algorithm: 'none' for manual positioning
          layout: config.layout || 'none',
          // Node alignment: 'justify', 'left', 'right'
          nodeAlign: config.nodeAlign || 'justify',
          // Orient: 'horizontal' or 'vertical'
          orient: config.orient || 'horizontal',
          // Node width - support both config.nodeWidth and sankeyConfig.nodeWidth
          nodeWidth: sankeyConfig.nodeWidth || config.nodeWidth || 20,
          // Gap between nodes - support nodePadding from sankeyConfig
          nodeGap: sankeyConfig.nodePadding || sankeyConfig.nodeGap || config.nodeGap || 8,
          // Layout iterations for optimization
          layoutIterations: config.layoutIterations || 32,
          
          emphasis: {
            focus: 'adjacency',
            blurScope: 'coordinateSystem',
            itemStyle: {
              borderColor: '#000',
              borderWidth: 2
            }
          },
          
          data: processedData.nodes.map((node, index) => ({
            ...node,
            itemStyle: {
              color: node.color || colors[index % colors.length],
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1
            },
            label: {
              show: true,
              position: config.labelPosition || 'right',
              color: isDarkMode ? '#e5e7eb' : '#374151',
              fontSize: config.labelFontSize || 12
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
          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          textStyle: {
            color: isDarkMode ? '#f3f4f6' : '#111827'
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