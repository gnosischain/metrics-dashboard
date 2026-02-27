/**
 * Sunburst Chart implementation for ECharts
 * Supports both sequence-based and parent-child hierarchical data
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

export class SunburstChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    
    return {
      ...this.getBaseOptions(isDarkMode),
      
      series: [{
        type: 'sunburst',
        data: this.assignColors(processedData.data, config, isDarkMode),
        radius: config.radius || [0, '90%'],
        center: config.center || ['50%', '50%'],
        sort: config.sort || 'desc',
        
        nodeClick: config.enableZoom !== false ? 'rootToNode' : false,
        
        emphasis: {
          focus: 'ancestor',
          blurScope: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        
        levels: [
          {}, // Level 0 - center (empty)
          
          {
            // Level 1 - Parent level (e.g., clients)
            r0: '15%',
            r: '50%',
            itemStyle: {
              borderRadius: 10,
              borderWidth: 2
            },
            label: {
              show: true,
              rotate: 'radial',
              fontSize: 14,
              fontWeight: 'bold',
              overflow: 'truncate',
              ellipsis: '...'
            }
          },
          
          {
            // Level 2 - Child level (e.g., versions)
            r0: '50%',
            r: '90%',
            itemStyle: {
              borderRadius: 5,
              borderWidth: 1
            },
            label: {
              show: true,
              rotate: 'radial',
              fontSize: 11,
              overflow: 'truncate',
              ellipsis: '...',
              formatter: (params) => {
                // Show only version name, keep it short
                const name = params.name;
                return name.length > 10 ? name.substring(0, 8) + '..' : name;
              }
            }
          },
          
          {
            // Level 3+ - Additional levels if needed
            r0: '90%',
            r: '92%',
            label: {
              show: true,
              rotate: 'radial',
              fontSize: 10,
              overflow: 'truncate',
              ellipsis: '...'
            },
            itemStyle: {
              borderWidth: 3
            }
          }
        ],
        
        label: {
          color: isDarkMode ? '#E2E8F0' : '#334155',
          overflow: 'truncate',
          rotate: 'radial'
        },
        
        itemStyle: {
          borderColor: isDarkMode ? '#334155' : '#FFFFFF',
          borderWidth: 2,
          gapWidth: 2
        }
      }],
      
      tooltip: {
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        extraCssText: isDarkMode
          ? 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);'
          : 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
        padding: 12,
        formatter: (params) => {
          const value = formatValue(params.value, config.format);
          const treePathInfo = params.treePathInfo || [];
          
          // Build full path string for tooltip
          const path = treePathInfo
            .slice(1) // Skip root
            .map(node => node.name)
            .join(' → ');
          
          // Calculate percentage
          let percentage = '';
          if (treePathInfo.length > 1) {
            const parent = treePathInfo[treePathInfo.length - 2];
            percentage = ((params.value / parent.value) * 100).toFixed(1);
          }
          
          // Show full names in tooltip
          return `
            <div style="font-weight: bold; margin-bottom: 4px;">${path}</div>
            <div>Count: <strong>${value}</strong></div>
            ${percentage ? `<div>Percentage: <strong>${percentage}%</strong></div>` : ''}
          `;
        }
      },
      
      graphic: config.enableZoom !== false ? [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: 'Click to zoom',
          fontSize: 12,
          fill: isDarkMode ? '#6b7280' : '#9ca3af'
        },
        z: 100
      }] : null
    };
  }

  static processData(data, config) {
    const {
      parentField = 'parent',
      childField = 'child',
      valueField = 'value',
      // Keep sequence support for backward compatibility
      sequenceField = 'sequence',
      separator = ' → '
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Sunburst chart data must be an array');
    }

    // Check if we have parent-child data or sequence data
    const hasParentChild = data.length > 0 && parentField in data[0] && childField in data[0];
    
    if (hasParentChild) {
      // Process parent-child hierarchical data (like validator data)
      const hierarchy = {};
      
      // Group by parent
      data.forEach(item => {
        const parent = item[parentField] || 'Unknown';
        const child = item[childField] || '';
        const value = parseFloat(item[valueField] || 0);
        
        if (!hierarchy[parent]) {
          hierarchy[parent] = {
            name: parent,
            value: 0,
            children: []
          };
        }
        
        // Add to parent's total value
        hierarchy[parent].value += value;
        
        // Add child
        if (child && child !== '') {
          hierarchy[parent].children.push({
            name: child,
            value: value
          });
        } else {
          // If no child, add as "Unknown" or increase parent's direct value
          hierarchy[parent].children.push({
            name: 'Unknown',
            value: value
          });
        }
      });
      
      // Convert to array and sort
      const result = Object.values(hierarchy);
      
      // Sort parents by total value (descending)
      result.sort((a, b) => b.value - a.value);
      
      // Sort children within each parent
      result.forEach(parent => {
        parent.children.sort((a, b) => b.value - a.value);
        // Remove children array if empty
        if (parent.children.length === 0) {
          delete parent.children;
        }
      });
      
      return { data: result };
      
    } else {
      // Original sequence-based processing
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

  static assignColors(nodes, config, isDarkMode) {
    const basePalette = this.resolveSeriesPalette(config, Math.max(nodes.length, 12), isDarkMode);
    
    return nodes.map((node, index) => {
      // Use palette colors, cycling through if needed
      const parentColor = basePalette[index % basePalette.length];
      
      const result = {
        ...node,
        itemStyle: {
          color: parentColor,
          borderColor: isDarkMode ? '#334155' : '#ffffff'
        }
      };

      if (node.children && node.children.length > 0) {
        // Generate child colors as variations of the parent color
        result.children = node.children.map((child, childIndex) => {
          // Create variations by adjusting the parent color
          const childColor = this.adjustColorBrightness(
            parentColor, 
            childIndex,
            node.children.length,
            isDarkMode
          );
          
          return {
            ...child,
            itemStyle: {
              color: childColor,
              borderColor: isDarkMode ? '#475569' : '#E2E8F0'
            }
          };
        });
      }

      return result;
    });
  }

  static adjustColorBrightness(color, index, total, isDarkMode) {
    // Simple brightness adjustment for child colors
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate adjustment factor
    let factor;
    if (total === 1) {
      factor = isDarkMode ? 1.2 : 0.9;
    } else {
      // Create a range from darker to lighter
      const range = isDarkMode ? [0.7, 1.3] : [0.6, 1.1];
      factor = range[0] + (index / (total - 1)) * (range[1] - range[0]);
    }
    
    // Apply factor
    const adjust = (value) => {
      const adjusted = Math.round(value * factor);
      return Math.max(0, Math.min(255, adjusted));
    };
    
    // Convert back to hex
    const toHex = (value) => {
      const hex = value.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
  }

  static validateData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('SunburstChart: Invalid data provided');
      return false;
    }
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      console.warn('SunburstChart: Data items must be objects');
      return false;
    }
    
    return true;
  }
}

export default SunburstChart;
