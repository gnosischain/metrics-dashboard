/**
 * Sunburst Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class SunburstChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = generateColorPalette(10, isDarkMode); // Generate enough colors for hierarchy

    return {
      ...this.getBaseOptions(isDarkMode),
      
      series: [{
        type: 'sunburst',
        data: this.assignColors(processedData.data, colors),
        radius: config.radius || [0, '75%'],
        center: config.center || ['50%', '50%'],
        sort: config.sort || null,
        emphasis: {
          focus: 'ancestor'
        },
        levels: [
          {},
          {
            r0: '15%',
            r: '35%',
            itemStyle: {
              borderWidth: 2
            },
            label: {
              align: 'right'
            }
          },
          {
            r0: '35%',
            r: '70%',
            label: {
              position: 'outside',
              padding: 3,
              silent: false
            }
          },
          {
            r0: '70%',
            r: '72%',
            label: {
              position: 'outside',
              padding: 3,
              silent: false
            },
            itemStyle: {
              borderWidth: 3
            }
          }
        ],
        label: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      }],
      
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const value = formatValue(params.value, config.format);
          return `${params.name}<br/><strong>${value}</strong>`;
        }
      }
    };
  }

  static processData(data, config) {
    const {
      sequenceField = 'sequence',
      valueField = 'value',
      separator = ' → '
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Sunburst chart data must be an array');
    }

    // Build hierarchy from sequence data
    const root = { name: 'root', children: [], value: 0 };

    data.forEach(item => {
      const sequence = item[sequenceField];
      const value = parseFloat(item[valueField] || 0);
      
      if (!sequence) return;

      const path = sequence.split(separator);
      let current = root;

      path.forEach((segment, index) => {
        let child = current.children.find(c => c.name === segment);
        
        if (!child) {
          child = {
            name: segment,
            children: [],
            value: 0
          };
          current.children.push(child);
        }
        
        child.value += value;
        current = child;
      });
    });

    // Remove empty children arrays for leaf nodes
    this.cleanupHierarchy(root);

    return { data: root.children };
  }

  static cleanupHierarchy(node) {
    if (node.children) {
      if (node.children.length === 0) {
        delete node.children;
      } else {
        node.children.forEach(child => this.cleanupHierarchy(child));
      }
    }
  }

  static assignColors(nodes, colors, level = 0) {
    return nodes.map((node, index) => {
      const colorIndex = level === 0 ? index : (level * 3 + index);
      const result = {
        ...node,
        itemStyle: {
          color: colors[colorIndex % colors.length]
        }
      };

      if (node.children) {
        result.children = this.assignColors(node.children, colors, level + 1);
      }

      return result;
    });
  }
}

export default SunburstChart;