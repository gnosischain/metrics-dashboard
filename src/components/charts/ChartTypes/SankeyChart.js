/**
 * Sankey Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class SankeyChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = generateColorPalette(processedData.nodes.length, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      series: [{
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency'
        },
        data: processedData.nodes.map((node, index) => ({
          ...node,
          itemStyle: {
            color: colors[index % colors.length]
          }
        })),
        links: processedData.links.map(link => ({
          ...link,
          lineStyle: {
            opacity: 0.6
          }
        })),
        label: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        },
        lineStyle: {
          curveness: 0.5
        }
      }],
      
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params) => {
          const formattedValue = formatValue(params.value, config.format);
          if (params.dataType === 'node') {
            return `${params.name}<br/>Value: <strong>${formattedValue}</strong>`;
          } else if (params.dataType === 'edge') {
            return `${params.source} → ${params.target}<br/>Value: <strong>${formattedValue}</strong>`;
          }
        }
      }
    };
  }

  static processData(data, config) {
    const {
      sourceField = 'source',
      targetField = 'target',
      valueField = 'value'
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Sankey chart data must be an array');
    }

    // Extract unique nodes
    const nodeSet = new Set();
    data.forEach(item => {
      nodeSet.add(item[sourceField]);
      nodeSet.add(item[targetField]);
    });

    const nodes = Array.from(nodeSet).map(name => ({ name }));
    
    // Create links
    const links = data.map(item => ({
      source: item[sourceField],
      target: item[targetField],
      value: parseFloat(item[valueField] || 0)
    }));

    return { nodes, links };
  }
}

export default SankeyChart;