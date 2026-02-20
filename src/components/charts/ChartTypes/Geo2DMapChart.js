/**
 * Geo2DMapChart Component - 2D Geographic Network Visualization
 * Location: src/components/charts/ChartTypes/Geo2DMapChart.js
 * 
 * Standard 2D world map with animated connection lines
 * Updated to support separate fields for filtering and node coloring
 */

import * as echarts from 'echarts/core';
import {
  GeoComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent
} from 'echarts/components';
import { MapChart, LinesChart, ScatterChart, EffectScatterChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { worldMapData } from './worldMapData';
import { generateColorPalette } from '../../../utils';

// Register required ECharts components
echarts.use([
  GeoComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MapChart,
  LinesChart,
  ScatterChart,
  EffectScatterChart,
  CanvasRenderer
]);

// Register world map on module load
echarts.registerMap('world', worldMapData);

export class Geo2DMapChart {
  static getOptions(data, config = {}, isDarkMode = false) {
    console.log('Geo2DMapChart: Processing data:', { dataLength: data.length, config });

    // Extract field names from config
    const {
      // Required fields
      peerLatField,
      peerLonField,
      neighborLatField,
      neighborLonField,
      
      // Optional fields
      valueField = null,
      labelField = null, // Used for filtering dropdown (e.g., network_type)
      categoryField = null, // NEW: Used for node coloring (e.g., peer_client)
      nodeColorField = null, // Alias for categoryField
      peerIdField = null,
      neighborIdField = null,
      peerNameField = null,
      neighborNameField = null,
      peerTooltipFields = [],
      neighborTooltipFields = [],
      
      // Visual customization
      nodeMinSize = 5,
      nodeMaxSize = 25,
      lineWidth = 1,
      lineOpacity = 0.6,
      lineHoverOpacity = 1,
      nodeBorderWidth = 1,
      
      // Animation settings
      enableAnimation = true,
      animationDuration = 2000,
      animationDelay = 0,
      
      // Trail effect settings
      trailLength = 0.1,
      symbolSize = 3,
      
      // Colors
      lineColor = isDarkMode ? '#34D399' : '#10B981',
      effectColor = isDarkMode ? '#E2E8F0' : '#334155',
      
      // Map settings
      mapZoom = 1.8,
      mapCenter = [10, 10]
    } = config;

    // Validate required fields
    if (!peerLatField || !peerLonField || !neighborLatField || !neighborLonField) {
      return this.getErrorOptions('Missing required latitude/longitude fields');
    }

    // Determine which field to use for node categorization/coloring
    // Priority: categoryField > nodeColorField > labelField > default
    const actualCategoryField = categoryField || nodeColorField || labelField;

    // Process data with separate fields for filtering and coloring
    const { nodes, connections } = this.processNetworkData(data, {
      peerLatField,
      peerLonField,
      neighborLatField,
      neighborLonField,
      valueField,
      labelField, // For filtering (e.g., network_type)
      categoryField: actualCategoryField, // For node coloring (e.g., peer_client)
      peerIdField,
      neighborIdField,
      peerNameField,
      neighborNameField,
      peerTooltipFields,
      neighborTooltipFields
    });

    // Get unique categories for coloring (from the category field, not label field)
    const categories = [...new Set(nodes.map(n => n.category))].filter(c => c && c !== 'Unknown');
    if (!categories.includes('Unknown')) {
      categories.push('Unknown');
    }
    
    console.log('Geo2DMapChart: Node categories for coloring:', categories);
    
    // Create color palette
    const colorPalette = generateColorPalette(15, isDarkMode);
    
    // Map categories to colors
    const categoryColorMap = {};
    categories.forEach((cat, index) => {
      categoryColorMap[cat] = colorPalette[index % colorPalette.length];
    });

    // Calculate value ranges
    const nodeValues = nodes.map(n => n.value);
    const maxNodeValue = Math.max(...nodeValues, 1);
    const minNodeValue = Math.min(...nodeValues, 1);
    
    const connectionValues = connections.map(c => c.value);
    const maxConnectionValue = Math.max(...connectionValues, 1);
    const minConnectionValue = Math.min(...connectionValues, 1);

    // Prepare series data
    const lineData = connections.map(conn => ({
      coords: conn.coords,
      value: conn.value,
      lineStyle: {
        width: this.scaleValue(conn.value, minConnectionValue, maxConnectionValue, lineWidth, lineWidth * 5)
      },
      // Store connection info for tooltip and filtering
      peerName: conn.peerName,
      neighborName: conn.neighborName,
      connectionCount: conn.value,
      peerCategory: conn.peerCategory,
      neighborCategory: conn.neighborCategory
    }));

    const scatterData = nodes.map(node => ({
      name: node.name,
      value: [...node.coords, node.value],
      symbolSize: this.scaleValue(node.value, minNodeValue, maxNodeValue, nodeMinSize, nodeMaxSize),
      category: node.category,
      filterLabel: node.filterLabel, // NEW: Store filter label separately
      itemStyle: {
        color: categoryColorMap[node.category] || '#999999',
        borderColor: isDarkMode ? '#0F172A' : '#FFFFFF',
        borderWidth: nodeBorderWidth
      },
      coords: node.coords,
      tooltipData: node.tooltipData
    }));

    const backgroundColor = 'transparent';
    const textColor = isDarkMode ? '#CBD5E1' : '#334155';
    const areaColor = isDarkMode ? '#1E293B' : '#EFF6FF';
    const borderColor = isDarkMode ? '#334155' : '#CBD5E1';
    const emphasisColor = isDarkMode ? '#273449' : '#DBEAFE';

    return {
      backgroundColor,
      legend: actualCategoryField ? {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        selectedMode: true,
        data: categories.map(cat => ({
          name: cat,
          icon: 'circle',
          itemStyle: {
            color: categoryColorMap[cat]
          }
        })),
        textStyle: {
          color: textColor
        },
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: borderColor,
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        inactiveColor: '#ccc'
      } : null,
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove|click',
        enterable: true,
        confine: true,
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: isDarkMode ? '#E2E8F0' : '#0F172A'
        },
        extraCssText: isDarkMode
          ? 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);'
          : 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
        formatter: (params) => {
          if (params.componentType === 'series' && (params.seriesType === 'scatter' || params.seriesType === 'effectScatter')) {
            const node = params.data;
            let tooltip = `<div style="font-weight: bold">${node.name}</div>`;
            
            // Show category (coloring field)
            if (node.category && actualCategoryField) {
              const categoryLabel = this.getFieldLabel(actualCategoryField);
              tooltip += `<div>${categoryLabel}: ${node.category}</div>`;
            }
            
            // Show filter label if different from category
            if (node.filterLabel && labelField && node.filterLabel !== node.category) {
              const filterLabel = this.getFieldLabel(labelField);
              tooltip += `<div>${filterLabel}: ${node.filterLabel}</div>`;
            }
            
            tooltip += `<div>Connections: ${node.value[2]}</div>`;
            
            if (node.coords) {
              tooltip += `<div>Location: ${node.coords[1].toFixed(2)}°, ${node.coords[0].toFixed(2)}°</div>`;
            }
            
            if (node.tooltipData && Object.keys(node.tooltipData).length > 0) {
              Object.entries(node.tooltipData).forEach(([key, value]) => {
                tooltip += `<div>${key}: ${value}</div>`;
              });
            }
            
            return tooltip;
          } else if (params.componentType === 'series' && params.seriesType === 'lines') {
            const data = params.data;
            return `
              <div style="font-weight: bold">Connection</div>
              <div>From: ${data.peerName || 'Unknown'}</div>
              <div>To: ${data.neighborName || 'Unknown'}</div>
              <div>Count: ${data.connectionCount || data.value}</div>
            `;
          }
          return '';
        }
      },
      geo: {
        map: 'world',
        roam: true,
        scaleLimit: {
          min: 0.5,
          max: 10
        },
        zoom: mapZoom,
        center: mapCenter,
        label: {
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          normal: {
            areaColor: areaColor,
            borderColor: borderColor
          },
          emphasis: {
            areaColor: emphasisColor
          }
        },
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%'
      },
      series: [
        // Create line series for each category - they will be controlled by legend
        ...categories.flatMap(category => {
          const categoryLines = lineData.filter(line => 
            line.peerCategory === category || line.neighborCategory === category
          );
          
          if (categoryLines.length === 0) return [];
          
          return [
            // Static lines for this category
            {
              id: `${category}_lines`,
              name: category,
              type: 'lines',
              coordinateSystem: 'geo',
              zlevel: 1,
              legendHoverLink: true,
              large: false,
              polyline: false,
              silent: false,
              clip: false,
              showSymbol: false,
              lineStyle: {
                color: lineColor,
                opacity: lineOpacity,
                curveness: 0.2
              },
              emphasis: {
                lineStyle: {
                  width: lineWidth * 2,
                  opacity: lineHoverOpacity,
                  color: '#FBBF24'
                }
              },
              data: categoryLines
            },
            // Animated lines effect for this category (if enabled)
            enableAnimation && {
              id: `${category}_effects`,
              name: category,
              type: 'lines',
              coordinateSystem: 'geo',
              zlevel: 2,
              legendHoverLink: true,
              showSymbol: false,
              symbol: ['none', 'arrow'],
              symbolSize: symbolSize,
              effect: {
                show: true,
                period: animationDuration / 1000,
                trailLength: trailLength,
                color: effectColor,
                symbolSize: symbolSize
              },
              lineStyle: {
                color: lineColor,
                width: 0,
                curveness: 0.2
              },
              data: categoryLines,
              animation: true,
              animationDuration: animationDuration,
              animationDelay: (idx) => {
                return animationDelay + (idx / categoryLines.length) * animationDuration;
              }
            }
          ];
        }).filter(Boolean),
        // Create scatter series for each category
        ...categories.map(category => ({
          id: `${category}_nodes`,
          name: category,
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          clip: false,
          legendHoverLink: true,
          data: scatterData.filter(d => d.category === category),
          symbolSize: (val) => val.symbolSize,
          itemStyle: {
            color: categoryColorMap[category]
          },
          label: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          emphasis: {
            scale: 1.5,
            label: {
              show: true,
              formatter: '{b}',
              position: 'top',
              color: textColor,
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.86)' : 'rgba(255, 255, 255, 0.9)',
              padding: [2, 5],
              borderRadius: 6,
              fontSize: 12
            },
            itemStyle: {
              borderColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.5)'
            }
          }
        }))
      ]
    };
  }

  static processNetworkData(data, fields) {
    const nodesMap = new Map();
    const connections = [];

    console.log('processNetworkData: Using fields:', {
      labelField: fields.labelField,
      categoryField: fields.categoryField
    });

    data.forEach(row => {
      // Process peer node
      const peerLat = parseFloat(row[fields.peerLatField]);
      const peerLon = parseFloat(row[fields.peerLonField]);
      const peerId = fields.peerIdField ? row[fields.peerIdField] : `${peerLat}_${peerLon}`;
      
      if (!isNaN(peerLat) && !isNaN(peerLon)) {
        if (!nodesMap.has(peerId)) {
          // Use categoryField for node coloring, labelField for filtering
          const category = fields.categoryField ? (row[fields.categoryField] || 'Unknown') : 'Default';
          const filterLabel = fields.labelField ? (row[fields.labelField] || 'Unknown') : null;
          const name = fields.peerNameField ? (row[fields.peerNameField] || 'Unknown') : peerId;
          
          nodesMap.set(peerId, {
            id: peerId,
            name: name,
            coords: [peerLon, peerLat],
            value: 0,
            category: category, // For coloring
            filterLabel: filterLabel, // For filtering
            tooltipData: this.extractTooltipData(row, fields.peerTooltipFields),
            type: 'peer'
          });
        }
      }

      // Process neighbor node
      const neighborLat = parseFloat(row[fields.neighborLatField]);
      const neighborLon = parseFloat(row[fields.neighborLonField]);
      const neighborId = fields.neighborIdField ? row[fields.neighborIdField] : `${neighborLat}_${neighborLon}`;
      
      if (!isNaN(neighborLat) && !isNaN(neighborLon)) {
        if (!nodesMap.has(neighborId)) {
          // Use categoryField for node coloring, labelField for filtering  
          const category = fields.categoryField ? (row[fields.categoryField] || 'Unknown') : 'Default';
          const filterLabel = fields.labelField ? (row[fields.labelField] || 'Unknown') : null;
          const name = fields.neighborNameField ? (row[fields.neighborNameField] || 'Unknown') : neighborId;
          
          nodesMap.set(neighborId, {
            id: neighborId,
            name: name,
            coords: [neighborLon, neighborLat],
            value: 0,
            category: category, // For coloring
            filterLabel: filterLabel, // For filtering
            tooltipData: this.extractTooltipData(row, fields.neighborTooltipFields),
            type: 'neighbor'
          });
        }
      }

      // Create connection
      if (nodesMap.has(peerId) && nodesMap.has(neighborId)) {
        const connectionValue = fields.valueField ? (parseFloat(row[fields.valueField]) || 1) : 1;
        
        // Update connection counts
        const peerNode = nodesMap.get(peerId);
        const neighborNode = nodesMap.get(neighborId);
        peerNode.value += connectionValue;
        neighborNode.value += connectionValue;

        connections.push({
          coords: [peerNode.coords, neighborNode.coords],
          value: connectionValue,
          peerName: peerNode.name,
          neighborName: neighborNode.name,
          peerCategory: peerNode.category,
          neighborCategory: neighborNode.category
        });
      }
    });

    const nodes = Array.from(nodesMap.values());
    console.log('processNetworkData: Processed nodes sample:', nodes.slice(0, 3));

    return {
      nodes: nodes,
      connections: connections
    };
  }

  static extractTooltipData(row, fields) {
    const data = {};
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        if (typeof field === 'string' && row[field] !== undefined) {
          data[field] = row[field];
        } else if (typeof field === 'object' && field.field && field.label) {
          data[field.label] = row[field.field];
        }
      });
    }
    return data;
  }

  static scaleValue(value, min, max, targetMin, targetMax) {
    if (max === min) return targetMin;
    const ratio = (value - min) / (max - min);
    return targetMin + ratio * (targetMax - targetMin);
  }

  static getFieldLabel(fieldName) {
    // Convert field names to readable labels
    const fieldLabels = {
      'peer_client': 'Client',
      'network_type': 'Network',
      'peer_country': 'Country',
      'neighbor_country': 'Country',
      'peer_org': 'Organization',
      'neighbor_org': 'Organization'
    };
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  static getErrorOptions(message) {
    return {
      title: {
        text: 'Configuration Error',
        subtext: message,
        left: 'center'
      }
    };
  }
}
