/**
 * Graph/Network Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class GraphChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = generateColorPalette(processedData.categories.length, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      series: [{
        type: 'graph',
        layout: config.layout || 'force',
        data: processedData.nodes.map(node => ({
          ...node,
          symbolSize: this.calculateNodeSize(node.value, processedData.minValue, processedData.maxValue, config),
          itemStyle: {
            color: colors[node.category % colors.length]
          },
          label: {
            show: config.showLabels !== false,
            color: isDarkMode ? '#e5e7eb' : '#374151'
          }
        })),
        links: processedData.links.map(link => ({
          ...link,
          lineStyle: {
            opacity: 0.6,
            curveness: config.curveness || 0
          }
        })),
        categories: processedData.categories.map((cat, index) => ({
          name: cat,
          itemStyle: {
            color: colors[index]
          }
        })),
        force: {
          repulsion: config.repulsion || 100,
          gravity: config.gravity || 0.1,
          edgeLength: config.edgeLength || 150,
          layoutAnimation: true
        },
        roam: true,
        focusNodeAdjacency: true,
        draggable: true
      }],
      
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            return `${params.name}<br/>Value: <strong>${formatValue(params.value, config.format)}</strong>`;
          } else if (params.dataType === 'edge') {
            return `${params.source} → ${params.target}<br/>Weight: <strong>${formatValue(params.value, config.format)}</strong>`;
          }
        }
      },
      
      legend: {
        show: config.showLegend !== false,
        data: processedData.categories,
        textStyle: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      }
    };
  }

  static processData(data, config) {
    const {
      sourceField = 'source',
      targetField = 'target',
      valueField = 'value',
      categoryField = 'category'
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Graph chart data must be an array');
    }

    // Extract nodes and their values
    const nodeMap = new Map();
    const categories = new Set();

    data.forEach(item => {
      const source = item[sourceField];
      const target = item[targetField];
      const value = parseFloat(item[valueField] || 1);
      const category = item[categoryField] || 'default';

      categories.add(category);

      // Add source node
      if (!nodeMap.has(source)) {
        nodeMap.set(source, { name: source, value: 0, category: 0 });
      }
      nodeMap.get(source).value += value;

      // Add target node
      if (!nodeMap.has(target)) {
        nodeMap.set(target, { name: target, value: 0, category: 0 });
      }
      nodeMap.get(target).value += value;
    });

    const categoriesArray = Array.from(categories);
    const nodes = Array.from(nodeMap.values()).map(node => ({
      ...node,
      category: categoriesArray.indexOf(node.category || 'default')
    }));

    const links = data.map(item => ({
      source: item[sourceField],
      target: item[targetField],
      value: parseFloat(item[valueField] || 1)
    }));

    const values = nodes.map(node => node.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return {
      nodes,
      links,
      categories: categoriesArray,
      minValue,
      maxValue
    };
  }

  static calculateNodeSize(value, minValue, maxValue, config) {
    const minSize = config.minNodeSize || 10;
    const maxSize = config.maxNodeSize || 50;
    
    if (maxValue === minValue) return (minSize + maxSize) / 2;
    
    const ratio = (value - minValue) / (maxValue - minValue);
    return minSize + ratio * (maxSize - minSize);
  }
}

export default GraphChart;