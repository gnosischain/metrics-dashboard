import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';

/**
 * InFrameZoomSlider component - renders inside the chart container as an overlay
 * @param {object} props - Component props
 * @param {number} props.min - The minimum value (0)
 * @param {number} props.max - The maximum value (100)
 * @param {number} props.currentMin - Current minimum value
 * @param {number} props.currentMax - Current maximum value
 * @param {function} props.onChange - Callback function (newMin, newMax)
 * @param {boolean} props.isDarkMode - Flag for dark mode styling
 * @param {object} props.chartRef - Reference to the chart instance
 * @returns {JSX.Element} The InFrameZoomSlider component
 */
const InFrameZoomSlider = ({ 
  min: propMin = 0, 
  max: propMax = 100, 
  currentMin, 
  currentMax, 
  onChange, 
  isDarkMode,
  chartRef
}) => {
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);
  const [dragging, setDragging] = useState(null);
  const trackRef = useRef(null);
  const [bottomOffset, setBottomOffset] = useState(40);

  // Calculate proper position based on chart dimensions
  useEffect(() => {
    if (chartRef && chartRef.current) {
      const chart = chartRef.current;
      const chartArea = chart.chartArea;
      if (chartArea) {
        // Position slider just below the chart area, above x-axis labels
        const containerHeight = chart.canvas.offsetHeight;
        const chartBottom = chartArea.bottom;
        const offset = containerHeight - chartBottom - 2; // 5px padding from chart area
        setBottomOffset(offset);
      }
    }
  }, [chartRef]);

  useEffect(() => {
    setLocalMin(currentMin);
  }, [currentMin]);

  useEffect(() => {
    setLocalMax(currentMax);
  }, [currentMax]);

  const debouncedOnChange = useCallback(debounce(onChange, 150), [onChange]);

  const getValueFromPosition = (clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const position = clientX - rect.left;
    let percentage = (position / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    return Math.round(percentage);
  };

  const handleMouseDown = (thumb) => (event) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent chart interactions
    setDragging(thumb);
  };

  const handleMouseMove = useCallback((event) => {
    if (!dragging || !trackRef.current) return;

    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    if (clientX === undefined) return;

    let newValue = getValueFromPosition(clientX);

    if (dragging === 'min') {
      newValue = Math.min(newValue, localMax - 1);
      newValue = Math.max(propMin, newValue);
      if (newValue !== localMin) {
        setLocalMin(newValue);
        debouncedOnChange(newValue, localMax);
      }
    } else if (dragging === 'max') {
      newValue = Math.max(newValue, localMin + 1);
      newValue = Math.min(propMax, newValue);
      if (newValue !== localMax) {
        setLocalMax(newValue);
        debouncedOnChange(localMin, newValue);
      }
    }
  }, [dragging, localMin, localMax, debouncedOnChange, propMin, propMax]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Styling
  const sliderTrackColor = isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.24)';
  const sliderThumbColor = isDarkMode ? '#818CF8' : '#4F46E5';
  const rangeColor = isDarkMode ? 'rgba(129, 140, 248, 0.34)' : 'rgba(79, 70, 229, 0.24)';
  const thumbSize = 12;
  const trackHeight = 4;

  const minThumbPosition = `calc(${localMin}% - ${thumbSize / 2}px)`;
  const maxThumbPosition = `calc(${localMax}% - ${thumbSize / 2}px)`;

  const containerStyle = {
    position: 'absolute',
    left: '44px',
    right: '10px',
    bottom: `${bottomOffset}px`, // Dynamic positioning based on chart area
    backgroundColor: 'transparent',
    padding: '8px 12px',
    borderRadius: '8px',
    zIndex: 10,
    pointerEvents: 'none' // Allow mouse events to pass through to chart
  };

  return (
    <div style={containerStyle}>
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          height: `${thumbSize}px`,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto' // Enable mouse events only for the slider track area
        }}
      >
        {/* Track Background */}
        <div
          style={{
            position: 'absolute',
            height: `${trackHeight}px`,
            width: '100%',
            backgroundColor: sliderTrackColor,
            borderRadius: `${trackHeight / 2}px`,
            top: `${(thumbSize - trackHeight) / 2}px`,
            cursor: 'pointer',
            pointerEvents: 'auto' // Enable clicks on track
          }}
          onClick={(e) => {
            // Allow clicking on track to set position
            const newValue = getValueFromPosition(e.clientX);
            const midpoint = (localMin + localMax) / 2;
            if (newValue < midpoint) {
              const clampedValue = Math.min(newValue, localMax - 1);
              setLocalMin(clampedValue);
              onChange(clampedValue, localMax);
            } else {
              const clampedValue = Math.max(newValue, localMin + 1);
              setLocalMax(clampedValue);
              onChange(localMin, clampedValue);
            }
          }}
        />
        
        {/* Selected Range */}
        <div
          style={{
            position: 'absolute',
            height: `${trackHeight}px`,
            left: `${localMin}%`,
            width: `${Math.max(0, localMax - localMin)}%`,
            backgroundColor: rangeColor,
            borderRadius: `${trackHeight / 2}px`,
            top: `${(thumbSize - trackHeight) / 2}px`,
            zIndex: 1,
          }}
        />
        
        {/* Min Thumb */}
        <div
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleMouseDown('min')}
          style={{
            position: 'absolute',
            left: minThumbPosition,
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            backgroundColor: sliderThumbColor,
            borderRadius: '50%',
            cursor: dragging === 'min' ? 'grabbing' : 'grab',
            zIndex: 2,
            border: `1px solid ${isDarkMode ? '#0F172A' : '#F8FAFC'}`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            touchAction: 'none',
          }}
        />
        
        {/* Max Thumb */}
        <div
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleMouseDown('max')}
          style={{
            position: 'absolute',
            left: maxThumbPosition,
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            backgroundColor: sliderThumbColor,
            borderRadius: '50%',
            cursor: dragging === 'max' ? 'grabbing' : 'grab',
            zIndex: 2,
            border: `1px solid ${isDarkMode ? '#0F172A' : '#F8FAFC'}`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default InFrameZoomSlider;
