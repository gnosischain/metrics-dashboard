import React, { useRef, useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

import { DEFAULT_COLORS, DARK_MODE_COLORS, hexToRgba } from '../utils/colors';
import WorldMapChart from './WorldMapChart';
import NumberWidget from './NumberWidget';
import StackedAreaChart from './StackedAreaChart';
import InFrameZoomSlider from './InFrameZoomSlider';
import TableWidget from './TableWidget';
import formatters from '../utils/formatter';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  zoomPlugin
);

/**
 * D3.js Sankey Chart Component
 */
const SankeyChart = ({ data, isDarkMode, config = {}, format, containerRef }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      console.warn('SankeyChart: Invalid data format');
      return;
    }

    console.log('SankeyChart: Input data:', data);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      console.warn('SankeyChart: No container rect available');
      return;
    }

    const margin = { top: 20, right: 30, bottom: 20, left: 30 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Prepare data for D3 Sankey
    // D3 Sankey modifies the original data, so we need to work with copies
    const sankeyData = {
      nodes: data.nodes.map(d => ({ ...d })), // Create copies of nodes
      links: data.links.map(d => ({ ...d }))  // Create copies of links
    };

    console.log('SankeyChart: Prepared data:', sankeyData);

    const sankeyGenerator = sankey()
      .nodeId(d => d.id) // Tell sankey how to identify nodes
      .nodeWidth(config.nodeWidth || 15)
      .nodePadding(config.nodePadding || 10)
      .extent([[1, 1], [width - 1, height - 5]]);

    try {
      // Generate the sankey layout
      const sankeyResult = sankeyGenerator(sankeyData);
      const { nodes, links } = sankeyResult;
      
      console.log('SankeyChart: Generated layout:', { nodes: nodes.length, links: links.length });

      const colorScale = d3.scaleOrdinal()
        .domain(nodes.map(d => d.id || d.name))
        .range(isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS);

      const textColor = isDarkMode ? '#ffffff' : '#333333';
      const linkOpacity = isDarkMode ? 0.6 : 0.5;
      const nodeStrokeColor = isDarkMode ? '#555555' : '#000000';

      const g = svg
        .attr('width', containerRect.width)
        .attr('height', containerRect.height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add links
      const link = g.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke', d => colorScale(d.source.id || d.source.name))
        .attr('stroke-opacity', linkOpacity)
        .attr('stroke-width', d => Math.max(1, d.width))
        .attr('fill', 'none');

      // Add nodes
      const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('rect')
        .data(nodes)
        .join('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', d => colorScale(d.id || d.name))
        .attr('stroke', nodeStrokeColor)
        .attr('stroke-width', 1);

      // Add node labels
      g.append('g')
        .attr('class', 'node-labels')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
        .attr('font-size', '12px')
        .attr('fill', textColor)
        .text(d => d.name || d.id);

      // Create tooltip
      const tooltip = d3.select('body').append('div')
        .attr('class', 'sankey-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', isDarkMode ? '#333333' : '#ffffff')
        .style('color', textColor)
        .style('border', `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`)
        .style('border-radius', '4px')
        .style('padding', '8px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '10000');

      // Add hover effects
      link
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('stroke-opacity', linkOpacity + 0.3)
            .attr('stroke-width', Math.max(2, d.width + 1));
          
          const value = format && formatters[format] 
            ? formatters[format](d.value)
            : d.value.toLocaleString();
          
          tooltip
            .style('visibility', 'visible')
            .html(`${d.source.name || d.source.id} → ${d.target.name || d.target.id}<br/>Value: ${value}`);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .attr('stroke-opacity', linkOpacity)
            .attr('stroke-width', Math.max(1, d.width));
          tooltip.style('visibility', 'hidden');
        });

      node
        .on('mouseover', function(event, d) {
          const totalValue = d.sourceLinks?.reduce((sum, link) => sum + link.value, 0) ||
                            d.targetLinks?.reduce((sum, link) => sum + link.value, 0) || 0;
          
          const value = format && formatters[format]
            ? formatters[format](totalValue)
            : totalValue.toLocaleString();
          
          tooltip
            .style('visibility', 'visible')
            .html(`${d.name || d.id}<br/>Total: ${value}`);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          tooltip.style('visibility', 'hidden');
        });

      return () => {
        tooltip.remove();
      };

    } catch (error) {
      console.error('SankeyChart: Error generating layout:', error);
      
      // Show error message in the SVG
      svg.append('text')
        .attr('x', containerRect.width / 2)
        .attr('y', containerRect.height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', isDarkMode ? '#ffffff' : '#333333')
        .text('Error generating Sankey diagram');
    }

  }, [data, isDarkMode, config, format]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
};

/**
 * D3.js Network Graph Component
 */
const NetworkGraph = ({ data, isDarkMode, config = {}, format, containerRef }) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const width = containerRect.width;
    const height = containerRect.height;

    const cfg = {
      nodeRadius: config.nodeRadius || 8,
      linkDistance: config.linkDistance || 50,
      linkStrength: config.linkStrength || 0.1,
      chargeStrength: config.chargeStrength || -300,
      centerStrength: config.centerStrength || 0.1,
      enableDrag: config.enableDrag !== false,
      enableZoom: config.enableZoom !== false,
      showLabels: config.showLabels !== false,
      clusterByGroup: config.clusterByGroup || false,
      ...config
    };

    const linkColor = isDarkMode ? '#666666' : '#999999';
    const textColor = isDarkMode ? '#ffffff' : '#333333';

    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.nodes.map(d => d.group || 'default'))])
      .range(isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS);

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    if (cfg.enableZoom) {
      svg.call(zoom);
    }

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g');

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links)
        .id(d => d.id)
        .distance(cfg.linkDistance)
        .strength(cfg.linkStrength))
      .force('charge', d3.forceManyBody().strength(cfg.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(cfg.centerStrength));

    if (cfg.clusterByGroup) {
      const groupCenters = {};
      const groups = [...new Set(data.nodes.map(d => d.group || 'default'))];
      
      groups.forEach((group, i) => {
        const angle = (i / groups.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.3;
        groupCenters[group] = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        };
      });

      simulation.force('cluster', d3.forceX()
        .x(d => groupCenters[d.group || 'default'].x)
        .strength(0.1))
        .force('clusterY', d3.forceY()
        .y(d => groupCenters[d.group || 'default'].y)
        .strength(0.1));
    }

    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', linkColor)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value || 1));

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', d => d.size || cfg.nodeRadius)
      .attr('fill', d => colorScale(d.group || 'default'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    let labels = null;
    if (cfg.showLabels) {
      labels = g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .text(d => d.name || d.id)
        .attr('font-size', '10px')
        .attr('fill', textColor)
        .attr('text-anchor', 'middle')
        .attr('dy', d => (d.size || cfg.nodeRadius) + 12);
    }

    if (cfg.enableDrag) {
      const drag = d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });

      node.call(drag);
    }

    const tooltip = d3.select('body').append('div')
      .attr('class', 'network-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', isDarkMode ? '#333333' : '#ffffff')
      .style('color', textColor)
      .style('border', `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10000');

    node
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 3)
          .attr('stroke', '#ffff00');
        
        link
          .attr('stroke-opacity', l => 
            (l.source === d || l.target === d) ? 1 : 0.1)
          .attr('stroke-width', l => 
            (l.source === d || l.target === d) ? Math.sqrt(l.value || 1) + 1 : Math.sqrt(l.value || 1));
        
        const connections = data.links.filter(l => l.source === d || l.target === d).length;
        const value = d.value && format && formatters[format]
          ? formatters[format](d.value)
          : d.value || 'N/A';
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.name || d.id}</strong><br/>
            ${d.group ? `Group: ${d.group}<br/>` : ''}
            ${d.value ? `Value: ${value}<br/>` : ''}
            Connections: ${connections}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 1.5)
          .attr('stroke', '#fff');
        
        link
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.sqrt(d.value || 1));
        
        tooltip.style('visibility', 'hidden');
      })
      .on('click', function(event, d) {
        setSelectedNode(d);
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      if (labels) {
        labels
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      }
    });

    return () => {
      tooltip.remove();
      simulation.stop();
    };

  }, [data, isDarkMode, config, format]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: isDarkMode ? '#333333' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`,
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          color: isDarkMode ? '#ffffff' : '#333333'
        }}
      >
        <div>Nodes: {data.nodes.length}</div>
        <div>Links: {data.links.length}</div>
        {selectedNode && (
          <div>
            <hr style={{ margin: '4px 0', borderColor: isDarkMode ? '#555555' : '#cccccc' }} />
            <div><strong>Selected:</strong></div>
            <div>{selectedNode.name || selectedNode.id}</div>
            {selectedNode.group && <div>Group: {selectedNode.group}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Universal chart component that handles various chart types including D3 visualizations
 */
const Chart = ({
  data,
  title,
  type = 'line',
  color = '#4285F4',
  height = 'auto',
  format,
  pointRadius = 3,
  showPoints = true,
  fill = false,
  stacked = false,
  stackedArea = false,
  isDarkMode = false,
  isTimeSeries = false,
  enableZoom = false,
  metricId,
  // D3-specific props
  sankeyConfig = {},
  networkConfig = {},
  // Table-specific props
  tableConfig = {}
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const legendContainerRef = useRef(null);
  const legendItemsRef = useRef(null);
  const legendControlsRef = useRef(null);
  const watermarkRef = useRef(null);

  const [chartInstance, setChartInstance] = useState(null);
  const [legendCreated, setLegendCreated] = useState(false);
  const [zoomRange, setZoomRange] = useState({ min: 80, max: 100 });

  // Determine chart type category
  const isD3Chart = ['sankey', 'network'].includes(type);
  const isChartJSChart = ['line', 'bar', 'pie', 'area', 'stackedBar', 'horizontalBar'].includes(type);

  // Safety check for data validity
  if (!data) {
    return (
      <div
        className="chart-container"
        style={{
          height: height === 'auto' ? '100%' : height,
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="no-data-message">No data available</div>
      </div>
    );
  }

  // Handle number display
  if (type === 'numberDisplay') {
    let value = 0;
    if (Array.isArray(data) && data.length > 0) {
      value = parseFloat(data[data.length - 1]?.value || 0);
    } else if (data && typeof data === 'object' && data.value !== undefined) {
      value = parseFloat(data.value || 0);
    }
    return <NumberWidget value={value} format={format} label={title} color={color} isDarkMode={isDarkMode} />;
  }

  // Handle map charts
  if (type === 'map') {
    return (
      <div className="chart-container no-legend" ref={containerRef} style={{
        height: height === 'auto' ? '100%' : height,
        position: 'relative',
        width: '100%',
      }}>
        <WorldMapChart data={data} isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div
        className="chart-container no-legend"
        ref={containerRef}
        style={{
          height: height === 'auto' ? '100%' : height,
          position: 'relative',
          width: '100%',
        }}
        data-theme={isDarkMode ? 'dark' : 'light'}
      >
        <TableWidget
          data={data}
          config={tableConfig}
          isDarkMode={isDarkMode}
          height={height === 'auto' ? '100%' : height}
          title={title}
          format={format}
        />
      </div>
    );
  }

  // Handle D3 charts
  if (isD3Chart) {
    const containerStyle = {
      height: height === 'auto' ? '100%' : height,
      position: 'relative',
      width: '100%',
    };

    return (
      <div
        className="chart-container d3-chart no-legend"
        ref={containerRef}
        style={containerStyle}
        data-theme={isDarkMode ? 'dark' : 'light'}
      >
        {type === 'sankey' && (
          <SankeyChart
            data={data}
            isDarkMode={isDarkMode}
            config={sankeyConfig}
            format={format}
            containerRef={containerRef}
          />
        )}
        {type === 'network' && (
          <NetworkGraph
            data={data}
            isDarkMode={isDarkMode}
            config={networkConfig}
            format={format}
            containerRef={containerRef}
          />
        )}
      </div>
    );
  }

  // Handle Chart.js charts (existing implementation)
  if (isChartJSChart) {
    const isAreaChart = type === 'area';
    const isStackedAreaChart = isAreaChart && (stackedArea || stacked);
    const isStackedBar = type === 'stackedBar' || (type === 'bar' && stacked);
    const isHorizontal = type === 'horizontalBar';
    const isPieChart = type === 'pie';

    const isMultiSeries = data &&
                         typeof data === 'object' &&
                         !Array.isArray(data) &&
                         data.labels &&
                         Array.isArray(data.labels) &&
                         data.datasets &&
                         Array.isArray(data.datasets);

    let actualChartType;
    if (isAreaChart || isStackedAreaChart) {
      actualChartType = 'line';
    } else if (isStackedBar) {
      actualChartType = 'bar';
    } else {
      actualChartType = type;
    }

    const defaultColors = isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS;
    const themeAdjustedColor = isDarkMode && color === '#4285F4' ? '#77aaff' : color;

    if (isStackedAreaChart && isMultiSeries) {
      return (
        <StackedAreaChart
          data={data}
          title={title}
          height={height}
          format={format ? format : null}
          isDarkMode={isDarkMode}
        />
      );
    }

    let chartDataProcessed;
    if (isPieChart) {
      if (Array.isArray(data)) {
        const labels = data.map(item =>
          item.category || item.country || item.label ||
          Object.values(item).find(v => typeof v === 'string') || 'Unknown'
        );
        const values = data.map(item =>
          parseFloat(item.value || item.cnt || item.count || 0)
        );
        const backgroundColors = values.map((_, i) =>
          hexToRgba(defaultColors[i % defaultColors.length], 0.7)
        );
        chartDataProcessed = {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(c => c.replace('rgba', 'rgb').replace(/,\s*[\d.]+\)/, ')')),
            borderWidth: 1
          }]
        };
      } else if (isMultiSeries) {
        chartDataProcessed = data;
      } else {
        chartDataProcessed = {
          labels: ['No Data'],
          datasets: [{
            data: [1],
            backgroundColor: [hexToRgba(themeAdjustedColor, 0.7)],
            borderColor: [hexToRgba(themeAdjustedColor, 0.9)],
            borderWidth: 1
          }]
        };
      }
    } else if (isMultiSeries) {
      chartDataProcessed = {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => {
          let baseColor = dataset.backgroundColor || dataset.borderColor || defaultColors[index % defaultColors.length];
          if (baseColor && baseColor.includes('rgba')) {
            baseColor = baseColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
          } else if (baseColor && baseColor.includes('#') && baseColor.length === 9) {
            baseColor = baseColor.substring(0, 7);
          }
          if (isDarkMode) {
            const defaultIndex = DEFAULT_COLORS.indexOf(baseColor);
            if (defaultIndex >= 0) {
              baseColor = DARK_MODE_COLORS[defaultIndex % DARK_MODE_COLORS.length];
            }
          }
          let fillValue = dataset.fill || fill;
          if (isAreaChart && !isStackedAreaChart) {
            fillValue = 'origin';
          }
          return {
            ...dataset,
            borderWidth: 2,
            pointRadius: showPoints ? pointRadius : 0,
            pointHoverRadius: showPoints ? pointRadius + 2 : 0,
            fill: fillValue,
            backgroundColor: hexToRgba(baseColor, 0.6),
            borderColor: hexToRgba(baseColor, 0.9),
            hoverBackgroundColor: hexToRgba(baseColor, 0.8),
            hoverBorderColor: baseColor
          };
        }),
      };
    } else {
      const getLabels = () => {
        if (!Array.isArray(data) || data.length === 0) return [];
        if (isPieChart || isHorizontal) {
          return data.map(item => item.category || item.country || item.label || Object.values(item).find(v => typeof v === 'string') || 'Unknown');
        } else {
          return data.map(item => {
            if (!item) return 'Unknown';
            return item.date || item.hour || item.timestamp || 'Unknown';
          });
        }
      };
      const getValues = () => {
        if (!Array.isArray(data) || data.length === 0) return [];
        return data.map(item => {
          if (!item) return 0;
          return parseFloat(item.value || item.cnt || item.count || 0);
        });
      };

      let datasetData;
      if (isTimeSeries && Array.isArray(data) && data.length > 0) {
        datasetData = data.map(item => ({
          x: item.date || item.hour || item.timestamp,
          y: parseFloat(item.value || item.cnt || item.count || 0)
        }));
      } else {
        datasetData = getValues();
      }

      chartDataProcessed = {
        labels: getLabels(),
        datasets: [
          {
            label: title || 'Data',
            data: datasetData,
            backgroundColor: hexToRgba(themeAdjustedColor, 0.6),
            borderColor: hexToRgba(themeAdjustedColor, 0.9),
            borderWidth: 2,
            pointRadius: showPoints ? pointRadius : 0,
            pointHoverRadius: showPoints ? pointRadius + 2 : 0,
            fill: isAreaChart ? 'origin' : fill,
            hoverBackgroundColor: hexToRgba(themeAdjustedColor, 0.8),
            hoverBorderColor: themeAdjustedColor
          },
        ],
      };
    }

    const getChartOptions = () => {
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      const textColor = isDarkMode ? '#ffffff' : '#333333';
      const tooltipBackground = isDarkMode ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      const tooltipTextColor = isDarkMode ? '#e0e0e0' : '#333333';
      const tooltipBorderColor = isDarkMode ? '#444444' : '#333333';

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isHorizontal ? 'y' : 'x',
        layout: { padding: { left: 10, right: 10, top: isPieChart ? 0 : 10, bottom: 15 } },
        plugins: {
          legend: { display: false, labels: { color: textColor } },
          tooltip: {
            enabled: true,
            mode: isPieChart ? 'nearest' : 'index',
            intersect: isPieChart ? true : false,
            backgroundColor: tooltipBackground,
            titleColor: tooltipTextColor,
            footerColor: tooltipTextColor,
            bodyColor: tooltipTextColor,
            borderColor: tooltipBorderColor,
            borderWidth: 1,
            cornerRadius: 6,
            boxPadding: 8,
            usePointStyle: true,
            callbacks: {
              title: (tooltipItems) => {
                if (!tooltipItems || tooltipItems.length === 0) return '';
                if (isTimeSeries && tooltipItems[0].chart.scales.x.type === 'time') {
                  const date = new Date(tooltipItems[0].parsed.x);
                  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }
                return tooltipItems[0].label || '';
              },
              label: (tooltipItem) => {
                if (!tooltipItem) return '';
                const dataset = tooltipItem.dataset || {};
                const value = tooltipItem.formattedValue || '0';
                return ` ${dataset.label || tooltipItem.label || 'Value'}: ${value}`;
              },
              footer: (tooltipItems) => {
                if (isHorizontal || isPieChart || !tooltipItems || tooltipItems.length === 0) return '';
                let total = 0;
                tooltipItems.forEach((tooltipItem) => {
                  if (!tooltipItem) return;
                  const parsed = tooltipItem.parsed || {};
                  total += parsed.y || parsed.x || 0;
                });
                const formattedTotal = format && formatters && typeof formatters[format] === 'function'
                  ? formatters[format](total)
                  : total.toLocaleString();
                return `Total: ${formattedTotal}`;
              }
            }
          },
          title: { color: textColor, display: false },
          filler: { propagate: true },
          zoom: {
            pan: {
              enabled: false, 
            },
            zoom: {
              wheel: {
                enabled: false, 
              },
              pinch: {
                enabled: false, 
              },
              drag: {
                  enabled: false, 
              },
              mode: 'x',
              onZoomComplete: ({chart}) => {
                  const {min: scaleMinVal, max: scaleMaxVal} = chart.scales.x;
                  const dataLabels = chart.data.labels;
                  const xData = chart.data.datasets[0]?.data?.map(d => d.x) || dataLabels;
                  const totalDataPoints = xData.length;

                  if (totalDataPoints > 1) {
                      let newMinPercent, newMaxPercent;
                      if (chart.scales.x.type === 'time') {
                          const firstTime = new Date(xData[0]).getTime();
                          const lastTime = new Date(xData[totalDataPoints - 1]).getTime();
                          const timeRange = lastTime - firstTime;
                          if (timeRange > 0) {
                              newMinPercent = Math.max(0, ((scaleMinVal - firstTime) / timeRange) * 100);
                              newMaxPercent = Math.min(100, ((scaleMaxVal - firstTime) / timeRange) * 100);
                          } else {
                              newMinPercent = 0; newMaxPercent = 100;
                          }
                      } else {
                          newMinPercent = Math.max(0, (scaleMinVal / (totalDataPoints - 1)) * 100);
                          newMaxPercent = Math.min(100, (scaleMaxVal / (totalDataPoints - 1)) * 100);
                      }
                      if (Math.abs(newMinPercent - zoomRange.min) > 0.1 || Math.abs(newMaxPercent - zoomRange.max) > 0.1) {
                         setZoomRange({ min: parseFloat(newMinPercent.toFixed(1)), max: parseFloat(newMaxPercent.toFixed(1)) });
                      }
                  }
              }
            }
          }
        },
        scales: isPieChart ? undefined : {
          x: {
            type: isTimeSeries ? 'time' : 'category',
            display: !isPieChart,
            grid: { display: false, borderColor: gridColor },
            border: { color: gridColor },
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: isTimeSeries ? 7 : 10,
              color: textColor,
              padding: 8,
              source: 'auto',
            },
            stacked: isStackedBar,
            time: isTimeSeries ? {
              unit: 'day',
              tooltipFormat: 'MMM dd, yyyy', 
              displayFormats: {
                  millisecond: 'HH:mm:ss.SSS',
                  second: 'HH:mm:ss',
                  minute: 'HH:mm',
                  hour: 'HH:mm',
                  day: 'MMM dd',
                  week: 'MMM dd',
                  month: 'MMM yyyy',
                  quarter: 'qqq yyyy',
                  year: 'yyyy',
              }
            } : {},
          },
          y: {
            display: !isPieChart,
            beginAtZero: true,
            grid: { color: gridColor, borderColor: gridColor },
            border: { color: gridColor },
            ticks: { color: textColor, padding: 8 },
            stacked: isStackedBar,
          },
        },
        elements: {
          line: { tension: 0.2 },
          point: { radius: 0, hitRadius: 30, hoverRadius: 0 },
          arc: { borderWidth: 0 }
        },
        interaction: { 
          mode: isPieChart ? 'nearest' : 'index', 
          intersect: isPieChart ? true : false,
        },
        hover: { 
          mode: isPieChart ? 'nearest' : 'index', 
          intersect: isPieChart ? true : false,
        },
      };

      // Apply initial zoom based on zoomRange state
      if (enableZoom && isTimeSeries && chartDataProcessed.datasets[0]?.data?.length > 1) {
          const datasetXValues = chartDataProcessed.datasets[0].data.map(d => d.x);
          const xData = (datasetXValues.length > 0 && datasetXValues[0] !== undefined) ? datasetXValues : chartDataProcessed.labels;
          const dataLength = xData.length;

          const minPercentFromState = zoomRange.min;
          const maxPercentFromState = zoomRange.max;

          const minIndex = Math.max(0, Math.floor(dataLength * (minPercentFromState / 100)));
          let maxIndex;
          if (maxPercentFromState === 100) {
              maxIndex = dataLength - 1;
          } else {
              maxIndex = Math.min(dataLength - 1, Math.floor(dataLength * (maxPercentFromState / 100)));
          }
          maxIndex = Math.max(minIndex, maxIndex);

          if (xData && xData.length > 0) {
              if (options.scales.x.type === 'time') {
                  if (xData[minIndex] !== undefined) options.scales.x.min = xData[minIndex];
                  if (xData[maxIndex] !== undefined) options.scales.x.max = xData[maxIndex];
              } else {
                  options.scales.x.min = minIndex;
                  options.scales.x.max = maxIndex;
              }
          }
      }
      return options;
    };

    // Chart.js legend and interaction functions
    const checkScrollButtonsNeeded = () => {
      if (!legendItemsRef.current || !legendControlsRef.current) return;
      const container = legendItemsRef.current;
      const controls = legendControlsRef.current;
      const hasOverflow = container.scrollWidth > container.clientWidth + 20;
      controls.style.display = hasOverflow ? 'flex' : 'none';
    };

    const handleResponsiveLegend = () => {
      if (!legendItemsRef.current) return;
      const container = legendItemsRef.current;
      const items = container.querySelectorAll('.legend-item');
      if (window.innerWidth <= 768) {
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        items.forEach(item => { item.style.marginBottom = '8px'; });
      } else {
        container.style.flexWrap = 'nowrap';
        container.style.justifyContent = 'flex-start';
        items.forEach(item => { item.style.marginBottom = '0'; });
        checkScrollButtonsNeeded();
      }
    };

    const cleanupExistingLegend = () => {
      if (containerRef.current) {
        const existingLegends = containerRef.current.querySelectorAll('.chart-legend-container');
        existingLegends.forEach(legend => { try { legend.parentNode.removeChild(legend); } catch (e) { /* Ignore */ } });
      }
    };

    const createCustomLegend = () => {
      if (!chartDataProcessed || !chartDataProcessed.datasets || chartDataProcessed.datasets.length === 0) return;
      if ((!isMultiSeries && !isPieChart)) return;
      cleanupExistingLegend();
      const legendContainer = document.createElement('div');
      legendContainer.className = 'chart-legend-container';
      const legendItemsContainer = document.createElement('div');
      legendItemsContainer.className = 'chart-legend-items';
      legendItemsRef.current = legendItemsContainer;
      let legendItems;
      if (isPieChart && chartDataProcessed && chartDataProcessed.labels) {
        legendItems = chartDataProcessed.labels.map((label, i) => ({
          label,
          backgroundColor: chartDataProcessed.datasets[0]?.backgroundColor[i] || defaultColors[i % defaultColors.length]
        }));
      } else if (chartDataProcessed && chartDataProcessed.datasets) {
        legendItems = chartDataProcessed.datasets;
      } else {
        return;
      }
      legendItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'legend-item';
        const colorBox = document.createElement('span');
        colorBox.className = 'legend-item-color';
        let solidColor = isPieChart ? item.backgroundColor : (item.backgroundColor || item.borderColor);
        if (solidColor && typeof solidColor === 'string' && solidColor.includes('rgba')) {
          solidColor = solidColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
        }
        colorBox.style.backgroundColor = solidColor || defaultColors[index % defaultColors.length];
        const label = document.createElement('span');
        label.className = 'legend-item-label';
        label.textContent = item.label || `Dataset ${index + 1}`;
        itemDiv.addEventListener('click', () => {
          if (chartRef.current) {
            const chart = chartRef.current;
            if (isPieChart) {
              try {
                const meta = chart.getDatasetMeta(0);
                if (meta && meta.data && meta.data[index]) {
                  meta.data[index].hidden = !meta.data[index].hidden;
                  chart.update();
                }
              } catch (e) { console.error('Error toggling pie chart segment:', e); }
            } else {
              try {
                const datasetMeta = chart.getDatasetMeta(index);
                if (datasetMeta) {
                  datasetMeta.hidden = !datasetMeta.hidden;
                  chart.update();
                }
              } catch (e) { console.error('Error toggling dataset visibility:', e); }
            }
            try {
              if ((isPieChart && chart.getDatasetMeta(0).data[index].hidden) ||
                  (!isPieChart && chart.getDatasetMeta(index).hidden)) {
                itemDiv.classList.add('hidden');
              } else {
                itemDiv.classList.remove('hidden');
              }
            } catch (e) { console.error('Error updating legend item CSS:', e); }
          }
        });
        itemDiv.appendChild(colorBox);
        itemDiv.appendChild(label);
        legendItemsContainer.appendChild(itemDiv);
      });
      const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'legend-controls';
      buttonWrapper.style.display = 'none';
      legendControlsRef.current = buttonWrapper;
      const leftButton = document.createElement('button');
      leftButton.className = 'legend-btn legend-btn-left';
      leftButton.innerHTML = '&larr;';
      leftButton.addEventListener('click', () => { legendItemsContainer.scrollBy({ left: -100, behavior: 'smooth' }); });
      const rightButton = document.createElement('button');
      rightButton.className = 'legend-btn legend-btn-right';
      rightButton.innerHTML = '&rarr;';
      rightButton.addEventListener('click', () => { legendItemsContainer.scrollBy({ left: 100, behavior: 'smooth' }); });
      buttonWrapper.appendChild(leftButton);
      buttonWrapper.appendChild(rightButton);
      legendContainer.appendChild(legendItemsContainer);
      legendContainer.appendChild(buttonWrapper);
      if (containerRef.current) {
        containerRef.current.insertBefore(legendContainer, containerRef.current.firstChild);
        legendContainerRef.current = legendContainer;
        setTimeout(() => {
          checkScrollButtonsNeeded();
          handleResponsiveLegend();
          setLegendCreated(true);
        }, 100);
      }
    };

    useEffect(() => {
      if (chartInstance && (isMultiSeries || isPieChart) && !legendCreated) {
        const timer = setTimeout(() => { createCustomLegend(); }, 100);
        return () => clearTimeout(timer);
      }
    }, [chartInstance, isMultiSeries, legendCreated, isPieChart, chartDataProcessed]);

    useEffect(() => {
      if (containerRef.current) {
        const existingWatermark = containerRef.current.querySelector('.chart-watermark');
        if (existingWatermark) existingWatermark.remove();
        const watermark = document.createElement('div');
        watermark.className = 'chart-watermark';
        watermarkRef.current = watermark;
        const logoUrl = isDarkMode
          ? 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_White_RGB.png'
          : 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_Black_RGB.png';
        watermark.style.backgroundImage = `url(${logoUrl})`;
        containerRef.current.appendChild(watermark);
      }
      return () => {
        if (watermarkRef.current) { try { watermarkRef.current.remove(); } catch (e) { /* Ignore */ } }
      };
    }, [containerRef.current, isDarkMode]);

    useEffect(() => {
      const handleResize = () => {
        if ((isMultiSeries || isPieChart) && legendCreated) {
          handleResponsiveLegend();
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [isMultiSeries, legendCreated, isPieChart]);

    useEffect(() => {
      return () => {
        if (chartInstance) chartInstance.destroy();
        cleanupExistingLegend();
        setLegendCreated(false);
      };
    }, [chartInstance]);

    const getChartRef = (chart) => {
      if (chart) {
        chartRef.current = chart;
        setChartInstance(chart);
      }
    };

    // useEffect to apply zoom when zoomRange changes (from slider) or chart is ready
    useEffect(() => {
      if (chartRef.current && isTimeSeries && enableZoom && chartDataProcessed && chartDataProcessed.datasets && chartDataProcessed.datasets[0]?.data) {
        const chart = chartRef.current;
        const datasetXValues = chartDataProcessed.datasets[0].data.map(d => d.x);
        const xData = (datasetXValues.length > 0 && datasetXValues[0] !== undefined) 
                      ? datasetXValues 
                      : chartDataProcessed.labels;
        const dataLength = xData.length;

        if (dataLength > 1) {
          const minPercentFromState = zoomRange.min;
          const maxPercentFromState = zoomRange.max;

          const newMinIndex = Math.max(0, Math.floor(dataLength * (minPercentFromState / 100)));
          let newMaxIndex = Math.min(dataLength - 1, Math.floor(dataLength * (maxPercentFromState / 100)));
          if (maxPercentFromState === 100) {
              newMaxIndex = dataLength - 1;
          }
          newMaxIndex = Math.max(newMinIndex, newMaxIndex); 

          let newScaleMin, newScaleMax;

          if (chart.options.scales.x.type === 'time') {
            if (xData[newMinIndex] !== undefined) newScaleMin = xData[newMinIndex]; else newScaleMin = xData[0];
            if (xData[newMaxIndex] !== undefined) newScaleMax = xData[newMaxIndex]; else newScaleMax = xData[dataLength-1];
          } else { 
            newScaleMin = newMinIndex;
            newScaleMax = newMaxIndex;
          }
          
          const currentChartMin = chart.scales.x.min;
          const currentChartMax = chart.scales.x.max;

          let needsUpdate = false;
          if (chart.options.scales.x.type === 'time') {
              const newScaleMinTime = newScaleMin !== undefined ? new Date(newScaleMin).getTime() : undefined;
              const newScaleMaxTime = newScaleMax !== undefined ? new Date(newScaleMax).getTime() : undefined;
              const currentChartMinTime = currentChartMin; 
              const currentChartMaxTime = currentChartMax;

              if (newScaleMinTime !== undefined && newScaleMinTime !== currentChartMinTime) {
                chart.options.scales.x.min = newScaleMin; 
                needsUpdate = true;
              }
              if (newScaleMaxTime !== undefined && newScaleMaxTime !== currentChartMaxTime) {
                chart.options.scales.x.max = newScaleMax; 
                needsUpdate = true;
              }
          } else { 
              if (newScaleMin !== undefined && newScaleMin !== currentChartMin) {
                chart.options.scales.x.min = newScaleMin;
                needsUpdate = true;
              }
              if (newScaleMax !== undefined && newScaleMax !== currentChartMax) {
                chart.options.scales.x.max = newScaleMax;
                needsUpdate = true;
              }
          }
          
          if (needsUpdate) {
            chart.update();
          }
        }
      }
    }, [zoomRange, chartInstance, isTimeSeries, enableZoom, chartDataProcessed]); 

    const handleZoomChange = (newMinPercent, newMaxPercent) => {
      setZoomRange({ min: newMinPercent, max: newMaxPercent });
    };

    const containerStyle = {
      height: height === 'auto' ? '100%' : height,
      position: 'relative',
      width: '100%',
    };

    let chartComponentType = actualChartType;
    if (isHorizontal) chartComponentType = 'bar';

    if (!chartDataProcessed || !chartDataProcessed.datasets || chartDataProcessed.datasets.length === 0) {
      return (
        <div className="chart-container" ref={containerRef} style={containerStyle}>
          <div className="no-data-message">No data available for chart</div>
        </div>
      );
    }

    let ChartComponentToRender;
    if (chartComponentType === 'line') ChartComponentToRender = Line;
    else if (chartComponentType === 'bar') ChartComponentToRender = Bar;
    else if (chartComponentType === 'pie') ChartComponentToRender = Pie;
    else ChartComponentToRender = Line;

    const chartOptions = getChartOptions(); 

    return (
      <div
        className={`chart-container ${(isMultiSeries || isPieChart) && chartDataProcessed && chartDataProcessed.datasets && chartDataProcessed.datasets.length > 0 ? 'has-legend' : 'no-legend'}`}
        ref={containerRef}
        style={{ ...containerStyle, position: 'relative' }}
        data-theme={isDarkMode ? 'dark' : 'light'}
        data-type={chartComponentType}
      >
        <ChartComponentToRender
          ref={getChartRef}
          data={chartDataProcessed}
          options={chartOptions}
          key={`${metricId}-${isDarkMode}`}
        />
        
        {/* In-frame zoom slider */}
        {enableZoom && isTimeSeries && chartInstance && chartDataProcessed.datasets[0]?.data?.length > 1 && (
          <InFrameZoomSlider
            min={0}
            max={100}
            currentMin={zoomRange.min}
            currentMax={zoomRange.max}
            onChange={handleZoomChange}
            isDarkMode={isDarkMode}
            chartRef={chartRef}
          />
        )}
      </div>
    );
  }

  // Fallback for unknown chart types
  return (
    <div className="chart-container">
      <div className="error-message">Unsupported chart type: {type}</div>
    </div>
  );
};

export default Chart;