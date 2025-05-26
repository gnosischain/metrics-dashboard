import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DARK_MODE_COLORS, DEFAULT_COLORS } from '../../utils/colors';
import formatters from '../../utils/formatter';

const NetworkGraph = ({
  data,
  isDarkMode = false,
  config = {},
  format,
  containerRef
}) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [timeRange, setTimeRange] = useState({ min: null, max: null });

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !containerRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      
      if (containerRef.current) {
        svg.append('text')
           .attr('x', containerRef.current.clientWidth / 2)
           .attr('y', containerRef.current.clientHeight / 2)
           .attr('text-anchor', 'middle')
           .style('fill', isDarkMode ? 'white' : 'black')
           .text(!data || !data.nodes || !data.links ? 'Invalid data for NetworkGraph' : 'Initializing...');
      }
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    // Configuration with enhanced defaults
    const cfg = {
      nodeRadius: config.nodeRadius || 8,
      linkDistance: config.linkDistance || 120,
      linkStrength: config.linkStrength || 0.05,
      chargeStrength: config.chargeStrength || -600,
      centerStrength: config.centerStrength || 0.1,
      enableDrag: config.enableDrag !== false,
      enableZoom: config.enableZoom !== false,
      showLabels: config.showLabels !== false,
      labelOffset: config.labelOffset || 12,
      clusterByGroup: config.clusterByGroup || false,
      
      // Temporal features
      linkColorByDate: config.linkColorByDate || false,
      linkColorDateRange: config.linkColorDateRange || (isDarkMode ? ['#4dabf7', '#e03131'] : ['#1971c2', '#c92a2a']),
      linkThicknessScale: config.linkThicknessScale || 1,
      minLinkThickness: config.minLinkThickness || 0.5,
      maxLinkThickness: config.maxLinkThickness || 5,
      highlightConnectedNodes: config.highlightConnectedNodes || true,
      
      ...config
    };

    // Theme colors
    const defaultLinkColor = isDarkMode ? '#777' : '#aaa';
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const nodeColors = isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS;

    // Create color scale for nodes (by group)
    const uniqueGroups = [...new Set(data.nodes.map(d => d.group || 'default'))];
    const nodeColorScale = d3.scaleOrdinal()
      .domain(uniqueGroups)
      .range(nodeColors);

    // Setup temporal coloring for links
    let linkColorScale = () => defaultLinkColor;
    let minDate = null, maxDate = null;

    if (cfg.linkColorByDate && data.links.length > 0) {
      const dateValues = data.links
        .map(l => l.date ? new Date(l.date) : null)
        .filter(d => d && !isNaN(d.getTime()));
      
      if (dateValues.length > 0) {
        [minDate, maxDate] = d3.extent(dateValues);
        setTimeRange({ min: minDate, max: maxDate });
        
        if (minDate && maxDate && minDate.getTime() !== maxDate.getTime()) {
          linkColorScale = d3.scaleTime()
            .domain([minDate, maxDate])
            .range(cfg.linkColorDateRange)
            .interpolate(d3.interpolateRgb);
        } else if (minDate) {
          linkColorScale = () => cfg.linkColorDateRange[0];
        }
      }
    }

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    if (cfg.enableZoom) {
      svg.call(zoom);
    }

    const mainGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Setup force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links)
        .id(d => d.id)
        .distance(cfg.linkDistance)
        .strength(cfg.linkStrength))
      .force('charge', d3.forceManyBody().strength(cfg.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(cfg.centerStrength));

    // Add clustering by group if enabled
    if (cfg.clusterByGroup && uniqueGroups.length > 1) {
      const groupCenters = {};
      uniqueGroups.forEach((group, i) => {
        const angle = (i / uniqueGroups.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.25;
        groupCenters[group] = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        };
      });

      simulation
        .force('clusterX', d3.forceX()
          .x(d => groupCenters[d.group || 'default'].x)
          .strength(0.1))
        .force('clusterY', d3.forceY()
          .y(d => groupCenters[d.group || 'default'].y)
          .strength(0.1));
    }

    // Calculate link thickness scale
    const linkValueExtent = d3.extent(data.links, d => d.value || 1);
    const thicknessScale = d3.scaleLinear()
      .domain(linkValueExtent[0] === linkValueExtent[1] ? [0, linkValueExtent[1]] : linkValueExtent)
      .range([cfg.minLinkThickness, cfg.maxLinkThickness]);

    // Create links
    const linkElements = mainGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', d => {
        if (cfg.linkColorByDate && d.date) {
          return linkColorScale(new Date(d.date));
        }
        return defaultLinkColor;
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => thicknessScale(d.value || 1) * cfg.linkThicknessScale);

    // Create nodes
    const nodeElements = mainGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', d => d.size || cfg.nodeRadius)
      .attr('fill', d => nodeColorScale(d.group || 'default'))
      .attr('stroke', isDarkMode ? '#1a1a1a' : '#fff')
      .attr('stroke-width', 1.5);

    // Create labels if enabled
    let labelElements = null;
    if (cfg.showLabels) {
      labelElements = mainGroup.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .text(d => {
          // Truncate long addresses for better display
          const name = d.name || d.id;
          return name.length > 10 ? `${name.substring(0, 6)}...${name.substring(name.length - 4)}` : name;
        })
        .attr('font-size', '9px')
        .attr('fill', textColor)
        .attr('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .attr('dy', d => -((d.size || cfg.nodeRadius) + cfg.labelOffset));
    }

    // Setup drag behavior
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
          // Keep nodes dragged (don't reset fx, fy)
        });
      
      nodeElements.call(drag);
    }

    // Create tooltip
    const tooltip = d3.select(containerRef.current.closest('body'))
      .selectAll('.network-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'network-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', isDarkMode ? 'rgba(40,40,40,0.95)' : 'rgba(255,255,255,0.95)')
      .style('color', textColor)
      .style('border', `1px solid ${isDarkMode ? '#555' : '#ccc'}`)
      .style('border-radius', '6px')
      .style('padding', '12px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10001')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.15)')
      .style('max-width', '250px');

    // Node interactions
    nodeElements
      .on('mouseover', function(event, d_node) {
        // Highlight node
        d3.select(this)
          .transition().duration(150)
          .attr('r', (d_node.size || cfg.nodeRadius) * 1.4)
          .attr('stroke-width', 3)
          .attr('stroke', d3.rgb(nodeColorScale(d_node.group || 'default')).brighter(1));

        // Highlight connected links and nodes if enabled
        if (cfg.highlightConnectedNodes) {
          linkElements
            .transition().duration(150)
            .attr('stroke-opacity', l => {
              const isConnected = l.source.id === d_node.id || l.target.id === d_node.id;
              return isConnected ? 1 : 0.1;
            })
            .attr('stroke-width', l => {
              const isConnected = l.source.id === d_node.id || l.target.id === d_node.id;
              const baseWidth = thicknessScale(l.value || 1) * cfg.linkThicknessScale;
              return isConnected ? baseWidth * 1.5 : baseWidth;
            });

          // Highlight connected nodes
          nodeElements
            .transition().duration(150)
            .attr('opacity', n => {
              if (n.id === d_node.id) return 1;
              const isConnected = data.links.some(l => 
                (l.source.id === d_node.id && l.target.id === n.id) ||
                (l.target.id === d_node.id && l.source.id === n.id)
              );
              return isConnected ? 1 : 0.3;
            });
        }

        // Show tooltip
        const connections = data.links.filter(l => l.source.id === d_node.id || l.target.id === d_node.id);
        const totalValue = connections.reduce((sum, l) => sum + (l.value || 0), 0);
        const nodeValue = format && formatters[format] && totalValue
          ? formatters[format](totalValue)
          : totalValue.toLocaleString();

        const displayName = d_node.name || d_node.id;
        const truncatedName = displayName.length > 20 
          ? `${displayName.substring(0, 10)}...${displayName.substring(displayName.length - 6)}`
          : displayName;

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: bold; margin-bottom: 8px;">${truncatedName}</div>
            ${d_node.group ? `<div style="margin-bottom: 4px;"><strong>Token:</strong> ${d_node.group}</div>` : ''}
            <div style="margin-bottom: 4px;"><strong>Connections:</strong> ${connections.length}</div>
            <div><strong>Total Volume:</strong> ${nodeValue}</div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY + 15) + 'px')
          .style('left', (event.pageX + 15) + 'px');
      })
      .on('mouseout', function(event, d_node) {
        // Reset node
        d3.select(this)
          .transition().duration(150)
          .attr('r', d_node.size || cfg.nodeRadius)
          .attr('stroke-width', 1.5)
          .attr('stroke', isDarkMode ? '#1a1a1a' : '#fff');

        // Reset links and nodes
        if (cfg.highlightConnectedNodes) {
          linkElements
            .transition().duration(150)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', l => thicknessScale(l.value || 1) * cfg.linkThicknessScale);

          nodeElements
            .transition().duration(150)
            .attr('opacity', 1);
        }

        tooltip.style('visibility', 'hidden');
      })
      .on('click', function(event, d_node) {
        setSelectedNode(prev => prev && prev.id === d_node.id ? null : d_node);
      });

    // Link interactions
    linkElements
      .on('mouseover', function(event, d_link) {
        d3.select(this)
          .transition().duration(100)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', thicknessScale(d_link.value || 1) * cfg.linkThicknessScale * 1.5);

        const sourceName = d_link.source.name || d_link.source.id;
        const targetName = d_link.target.name || d_link.target.id;
        const linkValue = format && formatters[format] && d_link.value
          ? formatters[format](d_link.value)
          : (d_link.value || 0).toLocaleString();

        const truncateAddress = (addr) => addr.length > 15 
          ? `${addr.substring(0, 8)}...${addr.substring(addr.length - 4)}`
          : addr;

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: bold; margin-bottom: 8px;">Transfer</div>
            <div style="margin-bottom: 4px;"><strong>From:</strong> ${truncateAddress(sourceName)}</div>
            <div style="margin-bottom: 4px;"><strong>To:</strong> ${truncateAddress(targetName)}</div>
            <div style="margin-bottom: 4px;"><strong>Value:</strong> ${linkValue}</div>
            ${d_link.date ? `<div><strong>Date:</strong> ${new Date(d_link.date).toLocaleDateString()}</div>` : ''}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY + 15) + 'px')
          .style('left', (event.pageX + 15) + 'px');
      })
      .on('mouseout', function(event, d_link) {
        d3.select(this)
          .transition().duration(100)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', thicknessScale(d_link.value || 1) * cfg.linkThicknessScale);
        
        tooltip.style('visibility', 'hidden');
      })
      .on('click', function(event, d_link) {
        setSelectedEdge(prev => prev === d_link ? null : d_link);
      });

    // Simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeElements
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      if (labelElements) {
        labelElements
          .attr('x', d => d.x)
          .attr('y', d => d.y - ((d.size || cfg.nodeRadius) + cfg.labelOffset));
      }
    });

    // Cleanup function
    return () => {
      tooltip.remove();
      simulation.stop();
    };

  }, [data, isDarkMode, config, format, containerRef]);

  // Info panel styling
  const infoPanelStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    border: `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`,
    borderRadius: '6px',
    padding: '12px',
    fontSize: '12px',
    color: isDarkMode ? '#ffffff' : '#333333',
    backdropFilter: 'blur(8px)',
    maxHeight: '200px',
    overflowY: 'auto',
    maxWidth: '250px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    lineHeight: '1.4'
  };

  // Time range display
  const formatTimeRange = () => {
    if (!timeRange.min || !timeRange.max) return 'No temporal data';
    
    const options = { month: 'short', day: 'numeric' };
    if (timeRange.min.getFullYear() !== timeRange.max.getFullYear()) {
      options.year = 'numeric';
    }
    
    return `${timeRange.min.toLocaleDateString(undefined, options)} - ${timeRange.max.toLocaleDateString(undefined, options)}`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: 'grab',
          background: isDarkMode ? '#1a1a1a' : '#f9f9f9'
        }} 
      />
      
      {data && data.nodes && data.links && (
        <div style={infoPanelStyle}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Network Stats</div>
          <div>Nodes: {data.nodes.length}</div>
          <div>Links: {data.links.length}</div>
          <div style={{ marginTop: '8px', fontSize: '11px' }}>
            Time Range: {formatTimeRange()}
          </div>
          
          {selectedNode && (
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: `1px solid ${isDarkMode ? '#555' : '#ccc'}` }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Selected Node:</div>
              <div style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                {selectedNode.name || selectedNode.id}
              </div>
              {selectedNode.group && (
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  Token: {selectedNode.group}
                </div>
              )}
            </div>
          )}
          
          {selectedEdge && (
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: `1px solid ${isDarkMode ? '#555' : '#ccc'}` }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Selected Transfer:</div>
              <div style={{ fontSize: '11px' }}>
                Value: {selectedEdge.value?.toLocaleString() || 'N/A'}
              </div>
              {selectedEdge.date && (
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  Date: {new Date(selectedEdge.date).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;