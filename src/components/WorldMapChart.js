import React, { useState, useEffect, memo, useRef } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker,
  ZoomableGroup
} from "react-simple-maps";

// Use a more reliable source for the world map TopoJSON
// This is the URL for a well-tested and widely used world map data source
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMapChart = ({ data = [], isDarkMode = false }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [formattedData, setFormattedData] = useState([]);
  const [maxValue, setMaxValue] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const watermarkRef = useRef(null); // Add watermark ref

  // Theme-based colors
  const backgroundColor = isDarkMode ? "#1a1a1a" : "#f8f9fa";
  const geographyFill = isDarkMode ? "#333333" : "#E6E6E9";
  const geographyStroke = isDarkMode ? "#555555" : "#9E9E9E";
  const geographyHoverFill = isDarkMode ? "#444444" : "#F0F0F3";
  const markerFill = isDarkMode ? "rgba(77, 144, 254, 0.7)" : "rgba(66, 133, 244, 0.7)";
  const markerStroke = isDarkMode ? "#4d90fe" : "#1E5DC9";
  const tooltipBackground = isDarkMode ? "#333333" : "white";
  const tooltipColor = isDarkMode ? "#e0e0e0" : "black";
  const tooltipBorder = isDarkMode ? "#555555" : "#ccc";

  // Process data when it changes
  useEffect(() => {
    setIsLoading(true);
    
    // Format the data for the map
    const processed = data
      .filter(point => point.lat && point.long)
      .map(point => ({
        coordinates: [parseFloat(point.long), parseFloat(point.lat)],
        value: parseFloat(point.cnt) || 1,
        name: point.name || point.country || 'Unknown'
      }))
      .filter(d => 
        !isNaN(d.coordinates[0]) && 
        !isNaN(d.coordinates[1]) && 
        !isNaN(d.value)
      );
    
    // Find the max value for sizing
    const max = processed.length > 0 
      ? Math.max(...processed.map(d => d.value)) 
      : 1;
    
    setFormattedData(processed);
    setMaxValue(max);
    setIsLoading(false);
    
    console.log(`Processed ${processed.length} data points for map`);
  }, [data]);

  // Handle tooltip position for touch devices
  const handleMouseMove = (e) => {
    if (showTooltip) {
      setTooltipPosition({ 
        x: e.clientX || e.touches?.[0]?.clientX || 0,
        y: e.clientY || e.touches?.[0]?.clientY || 0
      });
    }
  };

  // Add and remove mouse move event listener
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
    };
  }, [showTooltip]);

  // WE'RE NOT ADDING THE WATERMARK HERE
  // Because the Chart.js component that renders the WorldMapChart already adds a watermark
  // Having watermark code in both places creates duplicates

  return (
    <div 
      style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        backgroundColor: backgroundColor 
      }}
      ref={containerRef}
    >
      {isLoading ? (
        <div className="loading-indicator">Loading map data...</div>
      ) : (
        <>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 240,    // Adjusted scale to show more of the map
              center: [20, 5] // Centered on the prime meridian
            }}
            style={{
              width: "100%",
              height: "100%"
            }}
          >
            <ZoomableGroup>
              {/* Render countries with more visible styling */}
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={geographyFill}
                      stroke={geographyStroke}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          fill: geographyHoverFill,
                          outline: "none" 
                        },
                        pressed: { outline: "none" }
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Render data points */}
              {formattedData.map((point, index) => {
                // Scale the marker radius based on value (min 3, max 20)
                const radius = 3 + (point.value / maxValue) * 17;
                
                return (
                  <Marker 
                    key={`marker-${index}`}
                    coordinates={point.coordinates}
                    onMouseEnter={(e) => {
                      setTooltipContent(`${point.name}: ${point.value.toLocaleString()} nodes`);
                      setTooltipPosition({ 
                        x: e.clientX || e.pageX,
                        y: e.clientY || e.pageY
                      });
                      setShowTooltip(true);
                    }}
                    onMouseLeave={() => {
                      setShowTooltip(false);
                    }}
                    style={{
                      default: { cursor: "pointer" }
                    }}
                  >
                    <circle
                      r={radius}
                      fill={markerFill}
                      stroke={markerStroke}
                      strokeWidth={1}
                    />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: "fixed",
                top: tooltipPosition.y + 10,
                left: tooltipPosition.x + 10,
                padding: "8px 12px",
                background: tooltipBackground,
                color: tooltipColor,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "4px",
                boxShadow: isDarkMode 
                  ? "2px 2px 5px rgba(0,0,0,0.3)" 
                  : "2px 2px 5px rgba(0,0,0,0.1)",
                pointerEvents: "none",
                zIndex: 1000
              }}
            >
              {tooltipContent}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(WorldMapChart);