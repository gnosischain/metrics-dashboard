/**
 * Universal Watermark Utility
 * 
 * This utility provides a consistent watermark implementation for all chart types
 * (Chart.js, D3, and custom components) throughout the application.
 */

/**
 * Add watermark to a container element
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @param {Object} options - Optional customization options
 * @returns {HTMLElement} The created watermark element
 */
export const addUniversalWatermark = (containerRef, isDarkMode, options = {}) => {
    if (!containerRef?.current) {
      console.warn('Universal Watermark: No container reference provided');
      return null;
    }
  
    const {
      size = 30,
      position = 'bottom-right',
      margin = 10,
      opacity = isDarkMode ? 0.4 : 0.3,
      className = 'universal-chart-watermark',
      zIndex = 1000,
      preventDuplicates = true,
      customStyles = {}
    } = options;
  
    // Remove existing watermarks to prevent duplicates
    if (preventDuplicates) {
      const existingWatermarks = containerRef.current.querySelectorAll(
        '.chart-watermark, .chartjs-watermark, .d3-chart-watermark, .universal-chart-watermark, .modal-chart-watermark, .card-chart-watermark'
      );
      existingWatermarks.forEach(wm => {
        try { wm.remove(); } catch (e) { /* Ignore */ }
      });
    } else {
      // Only remove watermarks with the same className
      const existingWatermark = containerRef.current.querySelector(`.${className}`);
      if (existingWatermark) {
        existingWatermark.remove();
      }
    }
  
    // Create watermark element
    const watermark = document.createElement('div');
    watermark.className = className;
    
    // Calculate position based on options
    const positionStyles = getPositionStyles(position, size, margin);
    
    // Set watermark styles
    Object.assign(watermark.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      opacity: String(opacity),
      pointerEvents: 'none',
      zIndex: String(zIndex),
      ...positionStyles,
      ...customStyles // Apply custom styles last to allow overrides
    });
  
    const logoUrl = isDarkMode
      ? 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_White_RGB.png'
      : 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_Black_RGB.png';
  
    watermark.style.backgroundImage = `url(${logoUrl})`;
    
    // Fallback for load errors
    const img = new Image();
    img.onload = () => {
      watermark.style.backgroundImage = `url(${logoUrl})`;
    };
    img.onerror = () => {
      // Fallback to text watermark
      watermark.style.backgroundImage = 'none';
      watermark.style.backgroundColor = isDarkMode ? '#fff' : '#000';
    };
    img.src = logoUrl;
  
    containerRef.current.appendChild(watermark);
    return watermark;
  };
  
  /**
   * Calculate position styles based on position option
   * @param {string} position - Position option ('top-left', 'top-right', 'bottom-left', 'bottom-right')
   * @param {number} size - Watermark size
   * @param {number} margin - Margin from edges
   * @returns {Object} Position styles object
   */
  const getPositionStyles = (position, size, margin) => {
    switch (position) {
      case 'top-left':
        return { top: `${margin}px`, left: `${margin}px` };
      case 'top-right':
        return { top: `${margin}px`, right: `${margin}px` };
      case 'bottom-left':
        return { bottom: `${margin}px`, left: `${margin}px` };
      case 'bottom-right':
      default:
        return { bottom: `${margin}px`, right: `${margin}px` };
    }
  };
  
  /**
   * Remove watermark from a container
   * @param {React.RefObject} containerRef - Reference to the container element
   * @param {string} className - Watermark class name to remove
   */
  export const removeUniversalWatermark = (containerRef, className = 'universal-chart-watermark') => {
    if (!containerRef?.current) return;
    
    const existingWatermark = containerRef.current.querySelector(`.${className}`);
    if (existingWatermark) {
      existingWatermark.remove();
    }
  };
  
  /**
   * Setup watermark with automatic cleanup (non-hook version)
   * Use this in components by calling it in useEffect
   * @param {React.RefObject} containerRef - Reference to the container element
   * @param {boolean} isDarkMode - Whether dark mode is active
   * @param {Object} options - Optional customization options
   * @returns {Function} Cleanup function
   */
  export const setupUniversalWatermark = (containerRef, isDarkMode, options = {}) => {
    const timer = setTimeout(() => {
      addUniversalWatermark(containerRef, isDarkMode, options);
    }, 100);
    
    // Return cleanup function
    return () => {
      clearTimeout(timer);
      removeUniversalWatermark(containerRef, options.className);
    };
  };
  
  /**
   * Add watermark specifically for D3 charts
   * @param {React.RefObject} containerRef - Reference to the container element
   * @param {boolean} isDarkMode - Whether dark mode is active
   * @returns {HTMLElement} The created watermark element
   */
  export const addD3Watermark = (containerRef, isDarkMode) => {
    return addUniversalWatermark(containerRef, isDarkMode, {
      className: 'd3-chart-watermark',
      size: 30,
      position: 'bottom-right',
      margin: 10,
      opacity: isDarkMode ? 0.4 : 0.3
    });
  };
  
  /**
   * Add watermark specifically for Chart.js charts
   * @param {React.RefObject} containerRef - Reference to the container element
   * @param {boolean} isDarkMode - Whether dark mode is active
   * @returns {HTMLElement} The created watermark element
   */
  export const addChartJSWatermark = (containerRef, isDarkMode) => {
    return addUniversalWatermark(containerRef, isDarkMode, {
      className: 'chartjs-watermark',
      size: 30,
      position: 'bottom-right',
      margin: 10,
      opacity: isDarkMode ? 0.4 : 0.3,
      preventDuplicates: true // Prevent duplicate watermarks
    });
  };
  
  /**
   * Smart watermark function that detects context and prevents duplicates
   * @param {React.RefObject} containerRef - Reference to the container element
   * @param {boolean} isDarkMode - Whether dark mode is active
   * @param {string} context - Context where the watermark is being added ('modal', 'card', 'auto')
   * @returns {HTMLElement} The created watermark element
   */
  export const addSmartWatermark = (containerRef, isDarkMode, context = 'auto') => {
    if (!containerRef?.current) return null;
  
    // Detect if we're in a modal context
    const isInModal = context === 'modal' || 
      containerRef.current.closest('.chart-modal') || 
      containerRef.current.closest('[data-modal]') ||
      document.querySelector('.chart-modal-overlay');
  
    if (isInModal) {
      // In modal, use larger watermark with higher z-index
      return addUniversalWatermark(containerRef, isDarkMode, {
        className: 'modal-chart-watermark',
        size: 35,
        position: 'bottom-right',
        margin: 15,
        opacity: isDarkMode ? 0.4 : 0.3,
        zIndex: 1001,
        preventDuplicates: true
      });
    } else {
      // In card, use standard watermark
      return addUniversalWatermark(containerRef, isDarkMode, {
        className: 'card-chart-watermark',
        size: 30,
        position: 'bottom-right',
        margin: 10,
        opacity: isDarkMode ? 0.4 : 0.3,
        zIndex: 1001,
        preventDuplicates: true
      });
    }
  };
  
  /**
   * Add watermark for any chart type with automatic detection
   * @param {React.RefObject} containerRef - Reference to the container element
   * @param {boolean} isDarkMode - Whether dark mode is active
   * @param {string} chartType - Type of chart ('d3', 'chartjs', 'custom')
   * @returns {HTMLElement} The created watermark element
   */
  export const addChartWatermark = (containerRef, isDarkMode, chartType = 'custom') => {
    switch (chartType.toLowerCase()) {
      case 'd3':
        return addD3Watermark(containerRef, isDarkMode);
      case 'chartjs':
      case 'chart.js':
        return addChartJSWatermark(containerRef, isDarkMode);
      default:
        return addUniversalWatermark(containerRef, isDarkMode);
    }
  };
  
  /**
   * Default export for easy importing
   */
  const WatermarkUtils = {
    addUniversalWatermark,
    removeUniversalWatermark,
    setupUniversalWatermark,
    addD3Watermark,
    addChartJSWatermark,
    addChartWatermark,
    addSmartWatermark
  };
  
  export default WatermarkUtils;