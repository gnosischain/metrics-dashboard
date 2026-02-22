import { BaseChart } from './BaseChart';

export class GraphChart extends BaseChart {
  static processData(data, config) {
    // Transform flat data into nodes and links for graph
    const nodeMap = new Map();
    const links = [];
    const categories = new Map();
    
    // Count links per node for better positioning
    const nodeLinkCount = new Map();
    
    // Process data to create nodes and links
    data.forEach(row => {
      // Create/update source node
      const sourceId = row[config.sourceIdField];
      const targetId = row[config.targetIdField];
      
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, {
          id: sourceId,
          name: row[config.sourceNameField] || sourceId,
          category: row[config.sourceGroupField] || 'default',
          symbolSize: 10,
          value: 0,
          x: null,
          y: null
        });
      }
      
      // Create/update target node
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, {
          id: targetId,
          name: row[config.targetNameField] || targetId,
          category: row[config.targetGroupField] || 'default',
          symbolSize: 10,
          value: 0,
          x: null,
          y: null
        });
      }
      
      // Update node values
      const sourceNode = nodeMap.get(sourceId);
      const targetNode = nodeMap.get(targetId);
      const value = parseFloat(row[config.valueField] || 0);
      sourceNode.value += value;
      targetNode.value += value;
      
      // Track link counts
      nodeLinkCount.set(sourceId, (nodeLinkCount.get(sourceId) || 0) + 1);
      nodeLinkCount.set(targetId, (nodeLinkCount.get(targetId) || 0) + 1);
      
      // Track categories
      if (row[config.sourceGroupField]) {
        categories.set(row[config.sourceGroupField], true);
      }
      if (row[config.targetGroupField]) {
        categories.set(row[config.targetGroupField], true);
      }
      
      // Create link - store all data needed for tooltip
      links.push({
        source: sourceId,
        target: targetId,
        value: value,
        date: row[config.dateField],
        tokenAddress: row.token_address || row[config.sourceGroupField],
        // Store original row data
        _originalData: row
      });
    });
    
    // Convert nodes map to array and scale symbol sizes
    const nodes = Array.from(nodeMap.values());
    const maxValue = Math.max(...nodes.map(n => n.value));
    const minSize = config.networkConfig?.minNodeSize || 8;
    const maxSize = config.networkConfig?.maxNodeSize || 40;
    
    // Pre-layout nodes in a circle to start with better positions
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    nodes.forEach((node, index) => {
      // Scale node size based on value
      node.symbolSize = minSize + (node.value / maxValue) * (maxSize - minSize);
      
      // Initial circular layout
      const angle = (index / nodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
      
      // Nodes with more connections should be more central
      const linkCount = nodeLinkCount.get(node.id) || 0;
      const centralityFactor = Math.min(linkCount / 10, 1);
      node.x = node.x * (1 - centralityFactor * 0.5) + centerX * centralityFactor * 0.5;
      node.y = node.y * (1 - centralityFactor * 0.5) + centerY * centralityFactor * 0.5;
    });
    
    return {
      nodes,
      links,
      categories: Array.from(categories.keys()).map(name => ({ name }))
    };
  }
  
  static getOptions(data, config, isDarkMode) {
    if (!data || data.length === 0) {
      return this.getEmptyDataOptions(config, isDarkMode);
    }
    
    const { nodes, links, categories } = this.processData(data, config);
    const networkConfig = config.networkConfig || {};
    const categoryPalette = this.resolveSeriesPalette(config, Math.max(categories.length, 1), isDarkMode);
    const mappedCategories = categories.map((category, index) => ({
      ...category,
      itemStyle: {
        color: categoryPalette[index % categoryPalette.length]
      }
    }));
    
    // Date range for temporal coloring
    let dateRange = null;
    if (networkConfig.linkColorByDate && config.dateField) {
      const dates = links.map(l => new Date(l.date).getTime()).filter(d => !isNaN(d));
      if (dates.length > 0) {
        dateRange = [Math.min(...dates), Math.max(...dates)];
      }
    }
    
    // Scale for link thickness
    const values = links.map(l => l.value).filter(v => v > 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const minThickness = networkConfig.minLinkThickness || 0.5;
    const maxThickness = networkConfig.maxLinkThickness || 6;
    
    const options = {
      ...this.getBaseOptions(config, isDarkMode),
      color: categoryPalette,
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
        formatter: function(params) {
          console.log('Tooltip params:', params); // Debug log
          
          if (params.dataType === 'node') {
            const node = params.data;
            const formattedValue = (node.value || 0).toLocaleString();
            return `<div>
                      <strong style="font-size: 14px;">${node.name}</strong><br/>
                      <span style="color: ${isDarkMode ? '#94A3B8' : '#64748B'};">Category:</span> ${node.category}<br/>
                      <span style="color: ${isDarkMode ? '#94A3B8' : '#64748B'};">Total Value:</span> ${formattedValue}
                    </div>`;
          } else if (params.dataType === 'edge') {
            const edge = params.data;
            const formattedValue = (edge.value || 0).toLocaleString();
            let tooltipContent = `<div>
                      <strong style="font-size: 14px;">${edge.source} → ${edge.target}</strong><br/>
                      <span style="color: ${isDarkMode ? '#94A3B8' : '#64748B'};">Value:</span> ${formattedValue}`;
            
            if (edge.tokenAddress) {
              tooltipContent += `<br/><span style="color: ${isDarkMode ? '#94A3B8' : '#64748B'};">Token:</span> ${edge.tokenAddress}`;
            }
            
            if (edge.date) {
              const dateStr = new Date(edge.date).toLocaleDateString();
              tooltipContent += `<br/><span style="color: ${isDarkMode ? '#94A3B8' : '#64748B'};">Date:</span> ${dateStr}`;
            }
            
            tooltipContent += '</div>';
            return tooltipContent;
          }
          
          return '';
        }
      },
      legend: {
        data: categories.map(c => c.name),
        selected: {},
        show: categories.length > 1,
        type: 'scroll',
        orient: 'horizontal',
        bottom: 60
      },
      series: [{
        type: 'graph',
        layout: 'force',
        animation: true,
        animationDuration: 500,
        animationEasingUpdate: 'cubicOut',
        force: {
          initLayout: 'circular',
          repulsion: networkConfig.chargeStrength || 300,
          gravity: networkConfig.centerStrength || 0.1,
          edgeLength: networkConfig.linkDistance || 100,
          layoutAnimation: true,
          friction: 0.3,
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [0, 8]
        },
        draggable: networkConfig.enableDrag !== false,
        roam: networkConfig.enableZoom !== false ? true : false,
        scaleLimit: {
          min: 0.5,
          max: 5
        },
        data: nodes,
        edges: links.map(link => {
          // Calculate link color based on date
          let lineColor = isDarkMode ? '#64748B' : '#CBD5E1';
          if (networkConfig.linkColorByDate && dateRange && link.date) {
            const dateValue = new Date(link.date).getTime();
            const ratio = (dateValue - dateRange[0]) / (dateRange[1] - dateRange[0]);
            const colorRange = networkConfig.linkColorDateRange || ['#4dabf7', '#e03131'];
            lineColor = this.interpolateColor(colorRange[0], colorRange[1], ratio);
          }
          
          // Calculate link thickness based on value
          let thickness = minThickness;
          if (maxValue > minValue) {
            thickness = minThickness + 
              ((link.value - minValue) / (maxValue - minValue)) * (maxThickness - minThickness);
          }
          
          return {
            source: link.source,
            target: link.target,
            value: link.value,
            // Ensure all data is available for tooltip
            date: link.date,
            tokenAddress: link.tokenAddress,
            lineStyle: {
              color: lineColor,
              width: thickness * (networkConfig.linkThicknessScale || 1),
              curveness: 0.2,
              opacity: 0.6
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: thickness * (networkConfig.linkThicknessScale || 1) * 1.5,
                opacity: 1
              }
            }
          };
        }),
        categories: mappedCategories,
        label: {
          show: networkConfig.showLabels || false,
          position: 'right',
          formatter: '{b}',
          fontSize: 10
        },
        emphasis: {
          focus: networkConfig.highlightConnectedNodes !== false ? 'adjacency' : 'self',
          lineStyle: {
            width: 10
          }
        },
        itemStyle: {
          borderColor: isDarkMode ? '#334155' : '#FFFFFF',
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }]
    };
    
    return options;
  }
  
  // Helper method to interpolate between two colors
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
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    
    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
    
    return rgb2hex(r, g, b);
  }
}

export default GraphChart;
