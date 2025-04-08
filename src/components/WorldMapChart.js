// WorldMapChart.js - Fixed implementation with properly visible country outlines
import React, { useState, useEffect, memo } from 'react';
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

const WorldMapChart = ({ data = [] }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [formattedData, setFormattedData] = useState([]);
  const [maxValue, setMaxValue] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div 
      style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        backgroundColor: "#f8f9fa" 
      }}
    >
      {isLoading ? (
        <div className="loading-indicator">Loading map data...</div>
      ) : (
        <>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 150,    // Adjusted scale to show more of the map
              center: [0, 0] // Centered on the prime meridian
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
                      fill="#E6E6E9"           // Lighter fill for better contrast
                      stroke="#9E9E9E"         // Darker border for visibility
                      strokeWidth={0.5}        // Slightly thicker border
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          fill: "#F0F0F3",     // Lighter on hover
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
                      fill="rgba(66, 133, 244, 0.7)"  // Slightly more opaque
                      stroke="#1E5DC9"               // Darker border
                      strokeWidth={1}
                    />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Legend */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "white",
              padding: "5px 10px",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "rgba(66, 133, 244, 0.7)",
                border: "1px solid #1E5DC9",
                marginRight: "8px"
              }}
            ></div>
            <span>Node Distribution</span>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: "fixed",
                top: tooltipPosition.y + 10,
                left: tooltipPosition.x + 10,
                padding: "8px 12px",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
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