import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';

/**
 * ZoomSlider component with two draggable thumbs.
 * @param {object} props - Component props.
 * @param {number} props.min - The minimum value of the slider range (e.g., 0 for 0%).
 * @param {number} props.max - The maximum value of the slider range (e.g., 100 for 100%).
 * @param {number} props.currentMin - The current minimum value (controlled by parent).
 * @param {number} props.currentMax - The current maximum value (controlled by parent).
 * @param {function} props.onChange - Callback function `(newMin, newMax)` when the range changes.
 * @param {boolean} props.isDarkMode - Flag for dark mode styling.
 * @returns {JSX.Element} The ZoomSlider component.
 */
const ZoomSlider = ({ min: propMin, max: propMax, currentMin, currentMax, onChange, isDarkMode }) => {
  // Local state for thumb positions, initialized from props
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);
  // State to track which thumb is being dragged ('min', 'max', or null)
  const [dragging, setDragging] = useState(null);
  // Ref for the slider track element to calculate positions
  const trackRef = useRef(null);

  // Effect to update local state if currentMin prop changes from parent
  useEffect(() => {
    setLocalMin(currentMin);
  }, [currentMin]);

  // Effect to update local state if currentMax prop changes from parent
  useEffect(() => {
    setLocalMax(currentMax);
  }, [currentMax]);

  // Debounce the onChange callback to avoid excessive updates during drag
  const debouncedOnChange = useCallback(debounce(onChange, 150), [onChange]);

  /**
   * Calculates the slider value (percentage) based on the mouse/touch clientX position.
   * @param {number} clientX - The horizontal coordinate of the mouse/touch event.
   * @returns {number} The calculated percentage value, clamped between 0 and 100.
   */
  const getValueFromPosition = (clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const position = clientX - rect.left; // Position relative to the track's start
    let percentage = (position / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0% and 100%
    return Math.round(percentage); // Return as a whole number percentage
  };

  /**
   * Handles mouse down or touch start on a thumb.
   * Sets the `dragging` state to indicate which thumb is active.
   * @param {'min' | 'max'} thumb - Identifier for the thumb being dragged.
   */
  const handleMouseDown = (thumb) => (event) => {
    event.preventDefault(); // Prevent default actions like text selection
    setDragging(thumb);
  };

  /**
   * Handles mouse move or touch move events when a thumb is being dragged.
   * Calculates the new value for the thumb and updates state.
   */
  const handleMouseMove = useCallback((event) => {
    if (!dragging || !trackRef.current) return;

    // Get clientX from mouse or touch event
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    if (clientX === undefined) return; // Exit if no coordinate found

    let newValue = getValueFromPosition(clientX);

    if (dragging === 'min') {
      // Ensure min thumb doesn't cross max thumb (maintaining a 1% minimum gap)
      newValue = Math.min(newValue, localMax - 1);
      // Ensure min thumb doesn't go below the defined minimum (propMin, usually 0)
      newValue = Math.max(propMin, newValue);
      if (newValue !== localMin) {
        setLocalMin(newValue);
        debouncedOnChange(newValue, localMax); // Notify parent of change
      }
    } else if (dragging === 'max') {
      // Ensure max thumb doesn't cross min thumb
      newValue = Math.max(newValue, localMin + 1);
      // Ensure max thumb doesn't go above the defined maximum (propMax, usually 100)
      newValue = Math.min(propMax, newValue);
      if (newValue !== localMax) {
        setLocalMax(newValue);
        debouncedOnChange(localMin, newValue); // Notify parent of change
      }
    }
  }, [dragging, localMin, localMax, debouncedOnChange, propMin, propMax, getValueFromPosition]); // Added getValueFromPosition to dependencies

  /**
   * Handles mouse up or touch end events.
   * Clears the `dragging` state.
   */
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Effect to add/remove global event listeners for drag operations
  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false }); // passive: false for preventDefault in touchmove
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    }
    // Cleanup function to remove listeners when component unmounts or dragging changes
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);


  // Styling constants
  const sliderTrackColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
  const sliderThumbColor = isDarkMode ? '#58A6FF' : '#0969DA';
  const rangeColor = isDarkMode ? 'rgba(88, 166, 255, 0.4)' : 'rgba(9, 105, 218, 0.3)';
  const thumbSize = 16; // Increased thumb size for better touch interaction
  const trackHeight = 8; // px

  // Calculate thumb positions as percentages, adjusting for thumb size to center it
  const minThumbPosition = `calc(${localMin}% - ${thumbSize / 2}px)`;
  const maxThumbPosition = `calc(${localMax}% - ${thumbSize / 2}px)`;

  return (
    <div className="zoom-slider-container" style={{ padding: '15px 20px', backgroundColor: isDarkMode ? '#0D1117' : '#F6F8FA' }}>
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          height: `${thumbSize}px`, // Track container height accommodates thumbs
          width: '100%',
          display: 'flex',
          alignItems: 'center', // Vertically center items within this div (track elements)
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
            top: `${(thumbSize - trackHeight) / 2}px`, // Center track vertically
          }}
        />
        {/* Selected Range Highlight */}
        <div
          style={{
            position: 'absolute',
            height: `${trackHeight}px`,
            left: `${localMin}%`,
            width: `${Math.max(0, localMax - localMin)}%`, // Ensure width is not negative
            backgroundColor: rangeColor,
            // borderRadius is tricky for partial fill; often better to let track background show through
            // Or, apply border radius only if it's the full track or specific ends.
            // For simplicity, using the same as the track, but it might look slightly off at edges.
            borderRadius: `${trackHeight / 2}px`,
            top: `${(thumbSize - trackHeight) / 2}px`,
            zIndex: 1, // Above track background, below thumbs
          }}
        />
        {/* Min Thumb */}
        <div
          className="zoom-slider-thumb zoom-slider-thumb-min"
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleMouseDown('min')}
          style={{
            position: 'absolute',
            left: minThumbPosition,
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            backgroundColor: sliderThumbColor,
            borderRadius: '50%',
            cursor: dragging ? 'grabbing' : 'grab',
            zIndex: 2, // Above selected range highlight
            border: isDarkMode ? `2px solid #0D1117` : `2px solid #F6F8FA`, // Border matches container bg for "cutout" look
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            touchAction: 'none', // Prevent scrolling while dragging thumb on touch devices
          }}
        />
        {/* Max Thumb */}
        <div
          className="zoom-slider-thumb zoom-slider-thumb-max"
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleMouseDown('max')}
          style={{
            position: 'absolute',
            left: maxThumbPosition,
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            backgroundColor: sliderThumbColor,
            borderRadius: '50%',
            cursor: dragging ? 'grabbing' : 'grab',
            zIndex: 2,
            border: isDarkMode ? `2px solid #0D1117` : `2px solid #F6F8FA`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            touchAction: 'none',
          }}
        />
      </div>
      {/* Display current min and max percentages - THIS PART IS COMMENTED OUT
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px', color: isDarkMode ? '#8B949E' : '#57606A' }}>
        <span>{Math.round(localMin)}%</span>
        <span>{Math.round(localMax)}%</span>
      </div>
      */}
    </div>
  );
};

export default ZoomSlider;